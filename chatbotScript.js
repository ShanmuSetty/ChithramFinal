const TMDB_API_KEY = "65ea96af80f5b3e1bdbb0b9a400eee5c";
const TMDB_BASE_URL = "https://api.themoviedb.org/3/search/movie";
const GEMINI_API_KEY = "AIzaSyB478DOoGP37F-F65K7SoUkLcOVkb-QtQ0";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_API_KEY;

// Toggle chatbot visibility
document.getElementById('chatbotToggle').addEventListener('click', function(event) {
    event.stopPropagation();
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotToggle = document.getElementById('chatbotToggle');
    chatbotContainer.classList.toggle('active');
    chatbotToggle.classList.toggle('hidden');
});

document.getElementById('chatbotContainer').addEventListener('click', function(event) {
    event.stopPropagation();
});

document.addEventListener('click', function() {
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotToggle = document.getElementById('chatbotToggle');
    if (chatbotContainer.classList.contains('active')) {
        chatbotContainer.classList.remove('active');
        chatbotToggle.classList.remove('hidden');
    }
});

document.getElementById('sendButton').addEventListener('click', async function() {
    const input = document.getElementById('chatInput');
    let userQuery = input.value.trim();
    if (!userQuery) return;

    const messagesDiv = document.querySelector('.chatbot-messages');

    // Display user message
    const userMessage = document.createElement('div');
    userMessage.textContent = userQuery;
    userMessage.classList.add('message');
    messagesDiv.appendChild(userMessage);
    input.value = '';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    // Show loading animation
    const loadingMessage = document.createElement('div');
    loadingMessage.classList.add('response', 'loading');
    loadingMessage.innerHTML = '<div class="spinner-grow text-light" role="status"><span class="visually-hidden">Loading...</span></div>';
    messagesDiv.appendChild(loadingMessage);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    let movieTitle = userQuery;

    try {
        // If the input is a descriptive sentence (more than 3 words), use Gemini to extract the movie title
        if (userQuery.split(' ').length > 3) {
            const geminiExtractResponse = await fetch(GEMINI_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    contents: [{ parts: [{ text: `Extract only the movie title from this query: "${userQuery}", and give me only one word answer without any quotation marks,and only if there isn't a related film then check whether the residing words to the words={'movie'/'film'/'cinema'} are movies or not and then give me the movie if the residing word is a movie.` }] }] 
                })
            });

            const geminiExtractData = await geminiExtractResponse.json();
            movieTitle = geminiExtractData.candidates?.[0]?.content?.parts?.[0]?.text.trim() || userQuery;
            console.log(movieTitle);
        }

        // Fetch movie details from TMDb using extracted title
        const tmdbResponse = await fetch(`${TMDB_BASE_URL}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(movieTitle)}`);
        const tmdbData = await tmdbResponse.json();
        
        let poster = "https://via.placeholder.com/300x450?text=No+Image";
        if (tmdbData.results.length > 0) {
            poster = `https://image.tmdb.org/t/p/w500${tmdbData.results[0].poster_path}`;
        }

        // Fetch additional movie description from Gemini AI
        const geminiResponse = await fetch(GEMINI_API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: `Tell me about the movie ${movieTitle}.` }] }] })
        });
 
        const geminiData = await geminiResponse.json();
        const movieInfo = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "No additional information available.";

        // Remove loading animation
        messagesDiv.removeChild(loadingMessage);

        // Display response with formatted content
        const botMessage = document.createElement('div');
        botMessage.innerHTML = `<strong>${movieTitle}</strong><br><img src='${poster}' alt='Movie Poster'><br><p>${formatGeminiResponse(movieInfo)}</p>`;
        botMessage.classList.add('response');
        messagesDiv.appendChild(botMessage);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;

    } catch (error) {
        messagesDiv.removeChild(loadingMessage);
        const errorMessage = document.createElement('div');
        errorMessage.textContent = "Error fetching data. Please try again later.";
        errorMessage.classList.add('message', 'error');
        messagesDiv.appendChild(errorMessage);
    }
});

// Function to format Gemini AI response
function formatGeminiResponse(text) {
    // Convert **bold** to <strong>
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Convert *italic* to <em>
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Convert line breaks into paragraph tags
    text = text.replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>");

    // Convert lists (- item or * item) into <ul><li>
    text = text.replace(/(?:^|\n)[*-]\s+(.*?)(?=\n|$)/g, "<li>$1</li>");
    text = text.replace(/(<li>.*?<\/li>)+/g, "<ul>$&</ul>");

    // Convert numbered lists (1. item) into <ol><li>
    text = text.replace(/(?:^|\n)(\d+)\.\s+(.*?)(?=\n|$)/g, "<li>$2</li>");
    text = text.replace(/(<li>.*?<\/li>)+/g, "<ol>$&</ol>");

    // Convert "Movie Title:" and similar phrases into <h3>
    text = text.replace(/(?:^|\n)([A-Za-z\s]+):\s*(?=\n|$)/g, "<h3>$1</h3>");

    // Wrap in paragraph tags if not already wrapped
    if (!text.startsWith("<p>")) text = `<p>${text}</p>`;

    return text;
}
