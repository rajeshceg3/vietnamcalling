document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for Reveal Animations
    const revealElements = document.querySelectorAll('.text-content, .visual-content');
    revealElements.forEach(el => el.classList.add('reveal'));

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));

    // Cache Reduced Motion Preference
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = reduceMotionQuery.matches;
    reduceMotionQuery.addEventListener('change', () => {
        prefersReducedMotion = reduceMotionQuery.matches;
    });

    // 2. Smooth Scroll
    if (!prefersReducedMotion) {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    closeMobileMenu();
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // 3. Scroll Logic (Nav Background & Parallax)
    const nav = document.querySelector('.main-nav');
    const visualContents = document.querySelectorAll('.visual-content img');
    let lastKnownScrollPosition = 0;
    let scrollTicking = false;

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
        if (prefersReducedMotion) return;

        // Desktop only parallax check (min-width: 1024px)
        if (window.innerWidth >= 1024) {
            visualContents.forEach(img => {
                const rect = img.parentElement.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const speed = 0.05;
                    const offset = (window.innerHeight - rect.top) * speed;
                    img.style.transform = `scale(1.1) translateY(${offset}px)`;
                }
            });
        }
    }

    window.addEventListener('scroll', () => {
        lastKnownScrollPosition = window.scrollY;
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                updateNav(lastKnownScrollPosition);
                updateParallax(lastKnownScrollPosition);
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    }, { passive: true });

    // 4. Mouse Tracking & Magnetic Buttons (Desktop Only)
    // Check for fine pointer (mouse)
    if (window.matchMedia('(pointer: fine)').matches) {
        const body = document.body;
        let mouseTicking = false;
        let currentMouseX = 0;
        let currentMouseY = 0;

        // Optimized Spotlight Effect
        window.addEventListener('mousemove', (e) => {
            currentMouseX = e.clientX;
            currentMouseY = e.clientY;

            if (!mouseTicking) {
                requestAnimationFrame(() => {
                    body.style.setProperty('--mouse-x', `${currentMouseX}px`);
                    body.style.setProperty('--mouse-y', `${currentMouseY}px`);
                    mouseTicking = false;
                });
                mouseTicking = true;
            }
        }, { passive: true });

        // Optimized Magnetic Buttons
        const magneticElements = document.querySelectorAll('.magnetic');

        magneticElements.forEach(el => {
            let rect = null;

            // Cache rect on mouse enter to avoid layout thrashing during move
            el.addEventListener('mouseenter', () => {
                rect = el.getBoundingClientRect();
                el.style.transition = 'transform 0.1s ease-out';
            });

            el.addEventListener('mousemove', (e) => {
                if (!rect) return; // Safety check

                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Strength of the pull
                const strength = 15;

                // Use rAF for smoother visual updates if needed,
                // but direct transform is usually performant enough for simple translations
                // provided we aren't reading layout (getBoundingClientRect) here.
                el.style.transform = `translate(${x / strength}px, ${y / strength}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transition = 'transform 0.5s cubic-bezier(0.2, 0, 0.2, 1)'; // Elastic snap back
                el.style.transform = 'translate(0, 0)';
                rect = null; // Clear cache
            });
        });
    }

    // 5. Mobile Menu Logic
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const iconMenu = document.querySelector('.icon-menu');
    const iconClose = document.querySelector('.icon-close');
    const docBody = document.body;

    function toggleMobileMenu() {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        navLinks.classList.toggle('active');

        if (!isExpanded) {
            docBody.style.overflow = 'hidden';
            docBody.classList.add('nav-open');
            iconMenu.style.display = 'none';
            iconClose.style.display = 'block';
        } else {
            docBody.style.overflow = '';
            docBody.classList.remove('nav-open');
            iconMenu.style.display = 'block';
            iconClose.style.display = 'none';
        }
    }

    function closeMobileMenu() {
        if (!navLinks.classList.contains('active')) return;
        menuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('active');
        docBody.style.overflow = '';
        docBody.classList.remove('nav-open');
        iconMenu.style.display = 'block';
        iconClose.style.display = 'none';
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }
});
