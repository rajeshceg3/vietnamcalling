document.addEventListener('DOMContentLoaded', () => {
    // 1. Intersection Observer for Reveal Animations

    // Text Content: Fade Up
    const textElements = document.querySelectorAll('.text-content');
    textElements.forEach(el => el.classList.add('reveal'));

    // Visual Content: Clip Path Reveal
    const visualElements = document.querySelectorAll('.visual-content');

    const observerOptions = {
        root: null,
        rootMargin: '-10% 0px -10% 0px', // More precise triggering
        threshold: 0.15
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

    // 3. Scroll Logic (Smart Nav & Parallax)
    const nav = document.querySelector('.main-nav');
    const visualImages = document.querySelectorAll('.visual-content img');
    let lastKnownScrollPosition = 0;
    let scrollTicking = false;
    let previousScrollY = 0;

    function updateNav(scrollPos) {
        // Scrolled style
        if (scrollPos > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        // Smart Nav: Hide on scroll down, show on scroll up
        // Only trigger after passing the hero section to avoid flickering at top
        if (scrollPos > 600) {
            if (scrollPos > previousScrollY) {
                nav.classList.add('nav-hidden');
            } else {
                nav.classList.remove('nav-hidden');
            }
        } else {
            nav.classList.remove('nav-hidden');
        }
        previousScrollY = scrollPos;
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
                    const speed = 0.08; // Optimized for 1.1 scale
                    // Calculate offset based on center of viewport
                    const offset = (viewportHeight - rect.top) * speed;

                    // Apply using translate3d for hardware acceleration
                    // Base scale is 1.1 from CSS
                    img.style.transform = `scale(1.1) translate3d(0, ${offset}px, 0)`;
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

    // 4. Mouse Tracking & Magnetic Buttons (Desktop Only) with Optimized LERP
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
        const lerpFactor = 0.08; // Even smoother trailing

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
                el.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
            });

            el.addEventListener('mousemove', (e) => {
                if (!rect) return;
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;

                // Varies strength based on element type
                const strength = el.classList.contains('scroll-indicator') ? 4 : 6;

                el.style.transform = `translate(${x / strength}px, ${y / strength}px)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transition = 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
                el.style.transform = 'translate(0, 0)';
                rect = null;
            });
        });
    }

    // 5. Mobile Menu Logic - Polished
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
            // Animate Icon Switch
            iconMenu.style.display = 'none';
            iconClose.style.display = 'block';
            iconClose.style.opacity = '0';
            iconClose.style.transform = 'rotate(-90deg)';
            setTimeout(() => {
                iconClose.style.transition = 'all 0.4s ease';
                iconClose.style.opacity = '1';
                iconClose.style.transform = 'rotate(0deg)';
            }, 10);
        } else {
            closeMobileMenu();
        }
    }

    function closeMobileMenu() {
        if (!navLinks.classList.contains('active')) return;
        menuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('active');
        docBody.style.overflow = '';
        docBody.classList.remove('nav-open');

        // Animate Icon Switch Back
        iconClose.style.display = 'none';
        iconMenu.style.display = 'block';
        iconMenu.style.opacity = '0';
        iconMenu.style.transform = 'rotate(90deg)';
        setTimeout(() => {
            iconMenu.style.transition = 'all 0.4s ease';
            iconMenu.style.opacity = '1';
            iconMenu.style.transform = 'rotate(0deg)';
        }, 10);
    }

    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Close menu when clicking outside
    navLinks.addEventListener('click', (e) => {
         if (e.target === navLinks) {
             closeMobileMenu();
         }
    });
});
