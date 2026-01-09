document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for Reveal Animations

    // Text Content: Fade Up
    const textElements = document.querySelectorAll('.text-content');
    textElements.forEach(el => el.classList.add('reveal'));

    // Visual Content: Clip Path Reveal
    const visualElements = document.querySelectorAll('.visual-content');

    const observerOptions = {
        root: null,
        rootMargin: '-50px', // Trigger slightly before it enters fully
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('visual-content')) {
                    entry.target.classList.add('reveal-active');
                } else {
                    entry.target.classList.add('active');
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    textElements.forEach(el => observer.observe(el));
    visualElements.forEach(el => observer.observe(el));

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
    const visualImages = document.querySelectorAll('.visual-content img');
    let lastKnownScrollPosition = 0;
    let scrollTicking = false;

    function updateNav(scrollPos) {
        if (scrollPos > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }

    function updateParallax(scrollPos) {
        if (prefersReducedMotion) return;

        // Desktop only parallax check (min-width: 1024px)
        if (window.innerWidth >= 1024) {
            visualImages.forEach(img => {
                const rect = img.parentElement.getBoundingClientRect();
                const viewportHeight = window.innerHeight;

                // Check if element is in viewport (with buffer)
                if (rect.top < viewportHeight && rect.bottom > 0) {
                    // Parallax factor
                    const speed = 0.06; // Slower, more subtle
                    // Calculate offset based on center of viewport
                    const offset = (viewportHeight - rect.top) * speed;

                    // Apply using translate3d for hardware acceleration
                    // Maintain scale(1.15) which is the base scale for this effect
                    img.style.transform = `scale(1.15) translate3d(0, ${offset}px, 0)`;
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

    // 4. Mouse Tracking & Magnetic Buttons (Desktop Only) with LERP
    if (window.matchMedia('(pointer: fine)').matches) {
        const body = document.body;

        // Target values (where mouse is)
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;

        // Current values (where spotlight is)
        let currentX = targetX;
        let currentY = targetY;

        // Linear Interpolation
        const lerp = (start, end, factor) => start + (end - start) * factor;
        const lerpFactor = 0.1; // Lower = smoother/slower trailing

        window.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        }, { passive: true });

        function animateSpotlight() {
            currentX = lerp(currentX, targetX, lerpFactor);
            currentY = lerp(currentY, targetY, lerpFactor);

            body.style.setProperty('--mouse-x', `${currentX}px`);
            body.style.setProperty('--mouse-y', `${currentY}px`);

            requestAnimationFrame(animateSpotlight);
        }

        if (!prefersReducedMotion) {
            animateSpotlight();
        }

        // Magnetic Effect
        const magneticElements = document.querySelectorAll('.magnetic');

        magneticElements.forEach(el => {
            let rect = null;

            el.addEventListener('mouseenter', () => {
                rect = el.getBoundingClientRect();
                el.style.transition = 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)';
            });

            el.addEventListener('mousemove', (e) => {
                if (!rect) return;
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                const strength = 6; // More subtle
                el.style.transform = `translate(${x / strength}px, ${y / strength}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                el.style.transform = 'translate(0, 0)';
                rect = null;
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
