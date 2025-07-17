 const gotoTopBtn = document.getElementById('gotoTopBtn');
        

        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                gotoTopBtn.classList.add('visible');
                
            } else {
                gotoTopBtn.classList.remove('visible');
                
            }
        });

        // Smooth scroll to top function
        function scrollToTop() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }

        // Add click event listeners
        gotoTopBtn.addEventListener('click', scrollToTop);
        