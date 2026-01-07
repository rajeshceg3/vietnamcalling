document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for Reveal Animations
    // Target text content separately to allow staggering of children
    const revealElements = document.querySelectorAll('.text-content, .visual-content');

    // Add reveal class initially
    revealElements.forEach(el => el.classList.add('reveal'));

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // Trigger slightly earlier for smoother feel
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));

    // 2. Smooth Scroll for Navigation (with Reduced Motion check)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion) {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    // Close mobile menu if open
                    closeMobileMenu();

                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // 3. Navbar background on scroll & Parallax
    const nav = document.querySelector('.main-nav');
    const visualContents = document.querySelectorAll('.visual-content img');

    // Throttled scroll handler for performance
    let lastKnownScrollPosition = 0;
    let ticking = false;

    function updateNav(scrollPos) {
        if (scrollPos > 50) {
            nav.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
            nav.style.background = 'rgba(248, 245, 241, 0.85)';
        } else {
            nav.style.boxShadow = 'none';
            nav.style.background = 'rgba(248, 245, 241, 0.6)';
        }
    }

    function updateParallax(scrollPos) {
        // Check reduced motion inside the loop or use the global one if available
        const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Only run on desktop and if reduced motion is false
        if (window.innerWidth >= 1024 && !isReducedMotion) {
            visualContents.forEach(img => {
                const rect = img.parentElement.getBoundingClientRect();
                // Check if image is in viewport
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    // Calculate relative position
                    const speed = 0.05; // Subtle speed
                    const offset = (window.innerHeight - rect.top) * speed;
                    img.style.transform = `scale(1.1) translateY(${offset}px)`;
                }
            });
        }
    }

    window.addEventListener('scroll', () => {
        lastKnownScrollPosition = window.scrollY;

        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateNav(lastKnownScrollPosition);
                updateParallax(lastKnownScrollPosition);
                ticking = false;
            });

            ticking = true;
        }
    });

    // 4. Mobile Menu Logic
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const iconMenu = document.querySelector('.icon-menu');
    const iconClose = document.querySelector('.icon-close');
    const body = document.body;

    function toggleMobileMenu() {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);

        navLinks.classList.toggle('active');

        // Prevent background scroll
        if (!isExpanded) {
            body.style.overflow = 'hidden';
            // body.style.touchAction = 'none'; // Removed: this prevents menu scrolling too
        } else {
            body.style.overflow = '';
            // body.style.touchAction = '';
        }

        body.classList.toggle('nav-open');

        // Toggle Icons
        if (!isExpanded) {
            iconMenu.style.display = 'none';
            iconClose.style.display = 'block';
        } else {
            iconMenu.style.display = 'block';
            iconClose.style.display = 'none';
        }
    }

    function closeMobileMenu() {
        menuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('active');

        body.style.overflow = '';
        // body.style.touchAction = '';
        body.classList.remove('nav-open');

        iconMenu.style.display = 'block';
        iconClose.style.display = 'none';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }
});
