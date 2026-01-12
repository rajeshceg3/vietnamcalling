document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('js-loaded');
    const sections = document.querySelectorAll('section');

    // Navigation Toggle Logic
    const navToggle = document.querySelector('.nav-toggle');
    const navOverlay = document.querySelector('.nav-overlay');
    const navLinks = document.querySelectorAll('.nav-list a');
    const mainContentArea = document.querySelector('main');
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    // Focus Trap & Accessibility Helpers
    function setInertness(inert) {
        // Toggle aria-hidden on content outside the nav to manage focus flow for screen readers
        const ariaValue = inert ? 'true' : 'false';
        if (mainContentArea) mainContentArea.setAttribute('aria-hidden', ariaValue);
        if (header) header.setAttribute('aria-hidden', ariaValue);
        if (footer) footer.setAttribute('aria-hidden', ariaValue);
    }

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';

            navToggle.setAttribute('aria-expanded', !isExpanded);
            navOverlay.setAttribute('aria-hidden', isExpanded); // if was expanded (true), now false (hidden). Wait, logic inverse: expanded=false -> hidden=true. Click -> expanded=true -> hidden=false. Correct.
            document.body.classList.toggle('nav-open');

            setInertness(!isExpanded);

            if (!isExpanded) {
                // Menu is opening
                // Wait for transition (or requestAnimationFrame) then focus first link
                 // Wait a tick for visibility to change if needed, but visibility transition is handled in CSS
                setTimeout(() => {
                    const firstLink = navOverlay.querySelector('a');
                    if (firstLink) firstLink.focus();
                }, 100);
            } else {
                 // Menu is closing
                 navToggle.focus();
            }
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navToggle.setAttribute('aria-expanded', 'false');
                navOverlay.setAttribute('aria-hidden', 'true');
                document.body.classList.remove('nav-open');
                setInertness(false);
                navToggle.focus();
            });
        });

        // Focus Trap within Menu
        navOverlay.addEventListener('keydown', (e) => {
            if (e.key === 'Tab' || e.keyCode === 9) {
                const focusableItems = navOverlay.querySelectorAll('a, button');
                const firstItem = focusableItems[0];
                const lastItem = focusableItems[focusableItems.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstItem) {
                        e.preventDefault();
                        lastItem.focus();
                    }
                } else {
                    if (document.activeElement === lastItem) {
                        e.preventDefault();
                        firstItem.focus();
                    }
                }
            }
            if (e.key === 'Escape') {
                navToggle.click();
            }
        });
    }

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

        const headerElement = document.querySelector('header');
        if (headerElement) {
            headerElement.appendChild(readingTimeElement);
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

    // Parallax Effect - Optimized
    // Only attach if hover is supported (Desktop)
    if (window.matchMedia('(hover: hover)').matches) {
        let isParallaxTicking = false;

        document.addEventListener('mousemove', (e) => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            if (!isParallaxTicking) {
                window.requestAnimationFrame(() => {
                    // Subtle global parallax based on screen center
                    const x = (e.clientX - window.innerWidth / 2) / 100; // Small movement
                    const y = (e.clientY - window.innerHeight / 2) / 100;

                    document.body.style.setProperty('--mouse-x', `${x}px`);
                    document.body.style.setProperty('--mouse-y', `${y}px`);

                    isParallaxTicking = false;
                });
                isParallaxTicking = true;
            }
        });
    }
});
