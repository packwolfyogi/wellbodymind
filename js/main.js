/* ========================================
   WellBodyMind — Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation Scroll State ---
    const nav = document.getElementById('nav');

    const handleNavScroll = () => {
        if (window.scrollY > 60) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    };

    window.addEventListener('scroll', handleNavScroll, { passive: true });
    handleNavScroll();

    // --- Mobile Navigation Toggle ---
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const mobileOverlay = document.getElementById('mobileOverlay');

    const toggleMenu = () => {
        const isOpen = navToggle.classList.contains('active');
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        navToggle.setAttribute('aria-expanded', !isOpen);
        document.body.style.overflow = isOpen ? '' : 'hidden';
    };

    navToggle.addEventListener('click', toggleMenu);
    mobileOverlay.addEventListener('click', toggleMenu);

    // Close menu on link click
    navLinks.querySelectorAll('.nav__link').forEach(link => {
        link.addEventListener('click', () => {
            if (navLinks.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // --- Smooth Scroll with Offset ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const targetId = anchor.getAttribute('href');
            if (targetId === '#') return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 80;
                const top = target.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // --- Scroll Animations (IntersectionObserver) ---
    const animatedElements = document.querySelectorAll('[data-animate]');

    if (animatedElements.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -40px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // --- Testimonial Carousel ---
    const carousel = document.getElementById('testimonialCarousel');
    const dotsContainer = document.getElementById('testimonialDots');
    const prevBtn = document.querySelector('.testimonials__arrow--left');
    const nextBtn = document.querySelector('.testimonials__arrow--right');

    if (carousel && dotsContainer) {
        const cards = carousel.querySelectorAll('.testimonial-card');
        let currentIndex = 0;

        // Create dots
        cards.forEach((_, i) => {
            const dot = document.createElement('button');
            dot.className = 'testimonials__dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
            dot.addEventListener('click', () => scrollToCard(i));
            dotsContainer.appendChild(dot);
        });

        const dots = dotsContainer.querySelectorAll('.testimonials__dot');

        const updateDots = (index) => {
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
            currentIndex = index;
        };

        const scrollToCard = (index) => {
            const card = cards[index];
            if (card) {
                carousel.scrollTo({
                    left: card.offsetLeft - carousel.offsetLeft - 16,
                    behavior: 'smooth'
                });
                updateDots(index);
            }
        };

        // Arrow navigation
        prevBtn.addEventListener('click', () => {
            const newIndex = Math.max(0, currentIndex - 1);
            scrollToCard(newIndex);
        });

        nextBtn.addEventListener('click', () => {
            const newIndex = Math.min(cards.length - 1, currentIndex + 1);
            scrollToCard(newIndex);
        });

        // Update dots on scroll
        let scrollTimeout;
        carousel.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                const scrollLeft = carousel.scrollLeft;
                let closest = 0;
                let closestDist = Infinity;

                cards.forEach((card, i) => {
                    const dist = Math.abs(card.offsetLeft - carousel.offsetLeft - scrollLeft);
                    if (dist < closestDist) {
                        closestDist = dist;
                        closest = i;
                    }
                });

                updateDots(closest);
            }, 50);
        }, { passive: true });
    }

    // --- Contact Form ---
    const contactForm = document.getElementById('contactForm');
    const contactSuccess = document.getElementById('contactSuccess');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Clear previous errors
            contactForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
            contactForm.querySelectorAll('.form-error').forEach(el => el.remove());

            // Validate
            let valid = true;
            const name = contactForm.querySelector('#formName');
            const email = contactForm.querySelector('#formEmail');
            const subject = contactForm.querySelector('#formSubject');
            const message = contactForm.querySelector('#formMessage');

            if (!name.value.trim()) {
                showError(name, 'Please enter your name');
                valid = false;
            }

            if (!email.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
                showError(email, 'Please enter a valid email');
                valid = false;
            }

            if (!subject.value) {
                showError(subject, 'Please select a subject');
                valid = false;
            }

            if (!message.value.trim()) {
                showError(message, 'Please enter a message');
                valid = false;
            }

            if (!valid) return;

            // Submit
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    contactForm.style.display = 'none';
                    contactSuccess.hidden = false;
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (err) {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                const errorMsg = document.createElement('p');
                errorMsg.className = 'form-error';
                errorMsg.textContent = 'Something went wrong. Please email us directly.';
                errorMsg.style.textAlign = 'center';
                contactForm.appendChild(errorMsg);
            }
        });
    }

    function showError(input, message) {
        input.classList.add('error');
        const error = document.createElement('p');
        error.className = 'form-error';
        error.textContent = message;
        input.parentElement.appendChild(error);
    }

});
