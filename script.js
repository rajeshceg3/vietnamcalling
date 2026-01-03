document.addEventListener('DOMContentLoaded', () => {
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

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    backToTopButton.addEventListener('click', () => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
    });
});
