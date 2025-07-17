
        // Firebase imports
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
        import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

        // Firebase configuration
        const firebaseConfig = {
            apiKey: "your-api-key-here", // Replace with your actual API key
            authDomain: "mainproject-1js.firebaseapp.com",
            projectId: "mainproject-1js",
            storageBucket: "mainproject-1js.appspot.com",
            messagingSenderId: "543598482033",
            appId: "1:543598482033:web:60180eb3a3dd56f92081d0",
            measurementId: "G-R2ZCCMW7G6",
        };

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const database = getDatabase(app);

        // Global variables
        let currentIndex = 0;
        let cards = [];
        let totalCards = 0;
        let autoRotateInterval;
        let isAutoRotating = false;
        let moviesData = [];

        // Get input parameter (you can modify this as needed)
       const urlParams = new URLSearchParams(window.location.search);
const rawValue = urlParams.get("input") || "default";
const inputValue = decodeURIComponent(rawValue);

console.log("Input value:", inputValue);
document.title = `Chithram - ${inputValue}`;

        // Fetch data from Firebase
        async function fetchFirebaseData() {
            const loadingElement = document.getElementById('loading');
            const errorElement = document.getElementById('error');
            const carousel = document.getElementById('carousel');

            try {
                loadingElement.style.display = 'block';
                errorElement.style.display = 'none';

                const statesRef = ref(database, "states/");
                const snapshot = await get(statesRef);

                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const categoryData = data[inputValue] || data['Telangana'];

                    if (categoryData) {
                        const movieKeys = Object.keys(categoryData);
                        totalCards = movieKeys.length;
                        moviesData = [];

                        // Clear existing cards
                        carousel.innerHTML = '';

                        // Create cards dynamically
                        // Step 1: Collect raw movie data
movieKeys.forEach((movieKey) => {
    const movie = categoryData[movieKey];
    moviesData.push(movie);
});

// Step 2: Fetch posters for all movies
const updatedMovies = await fetchPostersForAll(moviesData);

// Step 3: Create cards using updated data
updatedMovies.forEach((movie, index) => {
    createCard(movie, index);
});


                        cards = document.querySelectorAll('.card');
                        
                        if (totalCards > 0) {
                            initCarousel();
                            showNavigationControls();
                        } else {
                            throw new Error('No movies found in this category');
                        }
                    } else {
                        throw new Error(`No data found for category: ${inputValue}`);
                    }
                } else {
                    throw new Error('No data available in database');
                }

                loadingElement.style.display = 'none';
            } catch (error) {
                console.error('Error fetching data:', error);
                loadingElement.style.display = 'none';
                errorElement.style.display = 'block';
                errorElement.textContent = `Error: ${error.message}`;
            }
        }
async function fetchPostersForAll(movies) {
    const apiKey = "65ea96af80f5b3e1bdbb0b9a400eee5c";

    const results = await Promise.all(movies.map(async (movie) => {
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(movie.title)}&year=${movie.description?.year}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            const posterPath = data?.results?.[0]?.poster_path;

            movie.poster = posterPath
                ? `https://image.tmdb.org/t/p/w500${posterPath}`
                : movie.poster;

            return movie;
        } catch (err) {
            console.warn(`Error fetching poster for ${movie.title}`, err);
            movie.poster = null;
            return movie;
        }
    }));

    return results;
}
        // Create individual card
        function createCard(movie, index) {
            const carousel = document.getElementById('carousel');
            const card = document.createElement('div');
            card.className = 'card';

            const cardContent = document.createElement('div');
            cardContent.className = 'card-content';

            card.style.backgroundImage = `url('${movie.poster || '🎬'}')`;

            // Create title
            const title = document.createElement('div');
            title.className = 'card-title';
            title.textContent = movie.title || 'Untitled';

            // Create subtitle (could be genre, rating, etc.)
            const subtitle = document.createElement('div');
            subtitle.className = 'card-subtitle';
            subtitle.textContent = movie.description?.genre || movie.description?.rating || 'Movie';
            
            cardContent.appendChild(title);
            cardContent.appendChild(subtitle);
            card.appendChild(cardContent);
            carousel.appendChild(card);

            // Add click handler for card interaction
            card.addEventListener('click', () => {
                openPopup(movie, index);
            });
        }

        // Open popup with movie details
        function openPopup(movie, index) {
            const popup = document.getElementById('popupOverlay');
            const container = document.getElementById('popupContainer');

            // Stop auto rotation
            stopAutoRotate();

            // Populate popup with movie data
            populatePopup(movie);

            // Show popup with animation
            popup.classList.add('active');
            
            // Animate popup entrance
            anime({
                targets: container,
                scale: [0.7, 1],
                rotateX: [45, 0],
                opacity: [0, 1],
                duration: 600,
                easing: 'easeOutBack'
            });

            // Animate sections with stagger effect
            anime({
                targets: '.info-section',
                translateY: [30, 0],
                opacity: [0, 1],
                duration: 800,
                delay: anime.stagger(100, {start: 300}),
                easing: 'easeOutQuart'
            });

            // Animate info items
            anime({
                targets: '.info-item',
                translateX: [-20, 0],
                opacity: [0, 1],
                duration: 600,
                delay: anime.stagger(50, {start: 500}),
                easing: 'easeOutQuart'
            });
        }

async function fetchFromTMDB(title, year) {
    const apiKey = "65ea96af80f5b3e1bdbb0b9a400eee5c";
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}&year=${year}`;

    try {
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (searchData.results && searchData.results.length > 0) {
            const movie = searchData.results[0];
            const movieId = movie.id;

            // Language mapping
            let originalLanguage = movie.original_language;
            const languageMap = {
                te: 'Telugu', en: 'English', hi: 'Hindi', ta: 'Tamil', kn: 'Kannada',
                ml: 'Malayalam', bn: 'Bengali', mr: 'Marathi', gu: 'Gujarati',
                pa: 'Punjabi', ur: 'Urdu', or: 'Odia', as: 'Assamese'
            };
            originalLanguage = languageMap[originalLanguage] || originalLanguage;

            // Credits (Director + Cast)
            const creditsUrl = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${apiKey}`;
            const creditsRes = await fetch(creditsUrl);
            const creditsData = await creditsRes.json();

            const director = creditsData.crew.find(person => person.job === "Director");

            // Top 5 cast with images
            const cast = creditsData.cast.slice(0, 5).map(person => ({
                name: person.name,
                character: person.character,
                profile: person.profile_path
                    ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                    : null
            }));

            // Details (for budget & revenue)
            const detailsUrl = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}`;
            const detailsRes = await fetch(detailsUrl);
            const details = await detailsRes.json();
            const poster = details.poster_path
    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
    : null;
            const productionHouses = details.production_companies?.map(pc => ({
    name: pc.name,
    logo: pc.logo_path ? `https://image.tmdb.org/t/p/w200${pc.logo_path}` : null
})) || [];
            return {
                director: director?.name || '-',
                language: originalLanguage || '-',
                duration: details.runtime ? `${details.runtime} min` : '-',
                overview: details.overview || '-',
                productionHouses: productionHouses,
                poster: poster,
                cast: cast
            };
        } else {
            console.warn(`❌ No TMDB result for "${title}" (${year})`);
            return { director: '-', language: '-', budget: '-', revenue: '-', cast: [] };
        }
    } catch (error) {
        console.error("TMDB fetch error:", error);
        return { director: '-', language: '-', budget: '-', revenue: '-', cast: [] };
    }
}






        // Populate popup with movie data
async function populatePopup(movie) {
    // Fetch TMDB data first
    const { director, language, duration, overview, productionHouses, poster, cast } = await fetchFromTMDB(movie.title, movie.description?.year);
// Locate the Cast & Crew section
const castSection = document.querySelector('.cast-crew h3.info-title');

// Remove any previously added cast image blocks (if re-populating)
const oldCastImages = document.querySelector('.cast-image-wrapper');
if (oldCastImages) oldCastImages.remove();

// Create a wrapper for cast images
const castWrapper = document.createElement('div');
castWrapper.className = 'cast-image-wrapper';
castWrapper.style.display = 'flex';
castWrapper.style.gap = '10px';
castWrapper.style.marginTop = '10px';
castWrapper.style.flexWrap = 'wrap';

cast.forEach(actor => {
    const card = document.createElement('div');
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'center';
    card.style.width = '80px';
    card.style.fontSize = '12px';

    const img = document.createElement('img');
    img.src = actor.profile || 'https://via.placeholder.com/80x120?text=No+Image';
    img.alt = actor.name;
    img.style.width = '80px';
    img.style.height = '120px';
    img.style.borderRadius = '8px';
    img.style.objectFit = 'cover';

    const name = document.createElement('div');
    name.textContent = actor.name;
    name.style.marginTop = '4px';
    name.style.textAlign = 'center';

    card.appendChild(img);
    card.appendChild(name);
    castWrapper.appendChild(card);
});

// Insert the cast wrapper right after the <h3> tag
castSection.insertAdjacentElement('afterend', castWrapper);


    // Basic info
    document.getElementById('popupPoster').src = poster|| movie.poster || '';
    document.getElementById('popupTitle').textContent = movie.title || 'Untitled';
    document.getElementById('popupSubtitle').textContent = 
        `${movie.description?.genre || 'Unknown'} • ${movie.description?.year || 'N/A'}`;
    document.getElementById('popupSynopsis').textContent = 
        overview || movie.description?.plot || 'No synopsis available.';

    // Movie details
    document.getElementById('popupDirector').textContent = director || movie.description?.director || '-';
    document.getElementById('popupGenre').textContent = movie.description?.genre || '-';
    document.getElementById('popupYear').textContent = movie.description?.year || '-';
    document.getElementById('popupLanguage').textContent = language || movie.description?.language || '-';
    document.getElementById('popupDuration').textContent = duration || '-';
    document.getElementById('popupCulturalImpact').textContent = movie.cultural_impact || 'No cultural impact data available.';
    

    // Ratings & Stats
    const rating = movie.description?.rating || movie.description?.imdb_rating;
    document.getElementById('popupRating').textContent = rating ? `⭐ ${rating}` : '-';


    const prodElem = document.getElementById('popupProductionHouse');
    const galleryElem = document.getElementById('popupGallery');
prodElem.innerHTML = ''; // Clear existing
galleryElem.innerHTML = ''; // Clear existing
if(movie.gallery.length > 0) {
    movie.gallery.forEach(image => {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '6px';
        wrapper.style.marginBottom = '6px';

        const img = document.createElement('img');
        img.src = image;
        img.alt = movie.title;
        
        
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center';
        img.style.borderRadius = '10px';
        img.style.marginRight = '10px';
        
        galleryElem.appendChild(img);
        img.classList.add('galleryCard');
    });
}
if (productionHouses.length === 0) {
    prodElem.textContent = '-';
} else {
    productionHouses.forEach(ph => {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '6px';
        wrapper.style.marginBottom = '6px';

        if (ph.logo) {
            const img = document.createElement('img');
            img.src = ph.logo;
            img.alt = ph.name;
            img.style.width = '100px';
            img.style.height = 'auto';
            img.style.objectFit = 'contain';
            img.style.borderRadius = '4px';
            wrapper.appendChild(img);
        }

        const name = document.createElement('span');
        name.textContent = ph.name;
        name.style.fontSize = '14px';

        wrapper.appendChild(name);
        prodElem.appendChild(wrapper);
    });
}

}


        // Close popup
        window.closePopup = function() {
            const popup = document.getElementById('popupOverlay');
            const container = document.getElementById('popupContainer');

            // Animate popup exit
            anime({
                targets: container,
                scale: [1, 0.7],
                rotateX: [0, -45],
                opacity: [1, 0],
                duration: 400,
                easing: 'easeInBack',
                complete: function() {
                    popup.classList.remove('active');
                    // Resume auto rotation after a delay
                    setTimeout(startAutoRotate, 1000);
                }
            });
        }

        // Close popup when clicking outside
        document.getElementById('popupOverlay').addEventListener('click', function(e) {
            if (e.target === this) {
                closePopup();
            }
        });

        // Close popup with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const popup = document.getElementById('popupOverlay');
                if (popup.classList.contains('active')) {
                    closePopup();
                }
            }
        });

        // Show navigation controls
        function showNavigationControls() {
            document.querySelector('.prev-btn').style.display = 'block';
            document.querySelector('.next-btn').style.display = 'block';
        }

        // Initialize carousel
        function initCarousel() {
            createDots();
            positionCards();
            updateDots();
            startAutoRotate();
        }

        // Create dot indicators
        function createDots() {
            const dotsContainer = document.getElementById('dotsContainer');
            dotsContainer.innerHTML = ''; // Clear existing dots
            
            for (let i = 0; i < totalCards; i++) {
                const dot = document.createElement('div');
                dot.className = 'dot';
                dot.onclick = () => goToCard(i);
                dotsContainer.appendChild(dot);
            }
        }

        // Position cards in 3D space
        function positionCards() {
            if (totalCards === 0) return;
            
            const angleStep = 360 / totalCards;
            // Calculate radius based on number of cards to prevent overlap
            // For 15 cards: radius will be around 600px
            const radius = Math.max(500, totalCards * 40);

            cards.forEach((card, index) => {
                const angle = angleStep * index;
                const radian = (angle * Math.PI) / 180;
                
                const x = Math.sin(radian) * radius;
                const z = Math.cos(radian) * radius;
                
                card.style.transform = `
                    translateX(${x}px) 
                    translateZ(${z}px) 
                    rotateY(${angle}deg)
                `;
                
            });
        }

        // Update carousel rotation
        function updateCarousel() {
            const carousel = document.getElementById('carousel');
            const rotationAngle = -(360 / totalCards) * currentIndex;
            carousel.style.transform = `rotateY(${rotationAngle}deg)`;
            updateDots();
        }

        // Update dot indicators
        function updateDots() {
            const dots = document.querySelectorAll('.dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        // Navigate to specific card
        function goToCard(index) {
            stopAutoRotate();
            currentIndex = index;
            updateCarousel();
            setTimeout(startAutoRotate, 3000);
        }

        // Navigate to next card
        window.nextCard = function() {
            stopAutoRotate();
            currentIndex = (currentIndex + 1) % totalCards;
            updateCarousel();
            setTimeout(startAutoRotate, 3000);
        }

        // Navigate to previous card
        window.prevCard = function() {
            stopAutoRotate();
            currentIndex = (currentIndex - 1 + totalCards) % totalCards;
            updateCarousel();
            setTimeout(startAutoRotate, 3000);
        }

        // Start auto rotation
        function startAutoRotate() {
            if (!isAutoRotating && totalCards > 1) {
                isAutoRotating = true;
                autoRotateInterval = setInterval(() => {
                    currentIndex = (currentIndex + 1) % totalCards;
                    updateCarousel();
                }, 4000);
            }
        }

        // Stop auto rotation
        function stopAutoRotate() {
            if (isAutoRotating) {
                clearInterval(autoRotateInterval);
                isAutoRotating = false;
            }
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (totalCards === 0) return;
            
            if (e.key === 'ArrowLeft') {
                window.prevCard();
            } else if (e.key === 'ArrowRight') {
                window.nextCard();
            } else if (e.key === ' ') {
                e.preventDefault();
                if (isAutoRotating) {
                    stopAutoRotate();
                } else {
                    startAutoRotate();
                }
            }
        });

        // Touch/swipe support
        let startX = 0;
        let startY = 0;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (totalCards === 0) return;
            
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = startX - endX;
            const diffY = startY - endY;

            // Only respond to horizontal swipes
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    window.nextCard();
                } else {
                    window.prevCard();
                }
            }
        });

        // Pause auto-rotation on hover
        const carousel = document.getElementById('carousel');
        carousel.addEventListener('mouseenter', stopAutoRotate);
        carousel.addEventListener('mouseleave', () => {
            setTimeout(startAutoRotate, 1000);
        });

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', fetchFirebaseData);
    

