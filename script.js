document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-loaded');
    const sections = document.querySelectorAll('section');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        observer.observe(section);
    });

    // Reading Time Calculation
    const mainContent = document.querySelector('main');
    if (mainContent) {
        // Use textContent to avoid reflow (layout thrashing)
        const text = mainContent.textContent;
        const wordCount = text.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 200);

        const readingTimeElement = document.createElement('p');
        readingTimeElement.id = 'reading-time';
        readingTimeElement.textContent = `${readingTime} min read`;
        readingTimeElement.setAttribute('aria-label', `Estimated reading time: ${readingTime} minutes`);

        const header = document.querySelector('header');
        if (header) {
            header.appendChild(readingTimeElement);
        }
    }

    // Back to Top functionality
    const backToTopButton = document.getElementById('back-to-top');
    let isScrolling = false;

    window.addEventListener('scroll', () => {
        if (!isScrolling) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 300) {
                    backToTopButton.classList.add('visible');
                    // Accessibility: Ensure it's reachable when visible
                    backToTopButton.setAttribute('aria-hidden', 'false');
                    backToTopButton.removeAttribute('tabindex'); // Allow natural focus
                } else {
                    backToTopButton.classList.remove('visible');
                    // Accessibility: Remove from tab order when hidden
                    backToTopButton.setAttribute('aria-hidden', 'true');
                    backToTopButton.setAttribute('tabindex', '-1');
                }
                isScrolling = false;
            });
            isScrolling = true;
        }
    }, { passive: true });

    // Initial state for accessibility
    backToTopButton.setAttribute('aria-hidden', 'true');
    backToTopButton.setAttribute('tabindex', '-1');

    backToTopButton.addEventListener('click', () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    });

    // Parallax Effect
    document.addEventListener('mousemove', (e) => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || window.matchMedia('(hover: none)').matches) return;

        requestAnimationFrame(() => {
             // Subtle global parallax based on screen center
             const x = (e.clientX - window.innerWidth / 2) / 100; // Small movement
             const y = (e.clientY - window.innerHeight / 2) / 100;

             document.body.style.setProperty('--mouse-x', `${x}px`);
             document.body.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
