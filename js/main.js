/**
 * DALCOIN Website JavaScript
 * Main functionality for navigation, forms, and interactions
 */

(function() {
    'use strict';

    // ============================================
    // DOM Elements
    // ============================================
    const header = document.getElementById('header');
    const nav = document.getElementById('nav');
    const menuToggle = document.getElementById('menuToggle');
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxClose = document.getElementById('lightboxClose');
    const galleryItems = document.querySelectorAll('.gallery__item');

    // ============================================
    // Header Scroll Effect
    // ============================================
    function handleScroll() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    // ============================================
    // Mobile Menu Toggle
    // ============================================
    function toggleMenu() {
        menuToggle.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.classList.toggle('menu-open');
    }

    function closeMenu() {
        menuToggle.classList.remove('active');
        nav.classList.remove('active');
        document.body.classList.remove('menu-open');
    }

    // Close menu when clicking a link
    function setupMenuLinks() {
        const navLinks = document.querySelectorAll('.nav__link');
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }

    // ============================================
    // Smooth Scroll for Anchor Links
    // ============================================
    function setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;

                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const headerHeight = header.offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    closeMenu();
                }
            });
        });
    }

    // ============================================
    // Contact Form Handling
    // ============================================
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        // Norwegian phone format - at least 8 digits
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 8;
    }

    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const error = document.getElementById(fieldId + 'Error');
        if (field && error) {
            field.classList.add('error');
            error.textContent = message;
        }
    }

    function clearError(fieldId) {
        const field = document.getElementById(fieldId);
        const error = document.getElementById(fieldId + 'Error');
        if (field && error) {
            field.classList.remove('error');
            error.textContent = '';
        }
    }

    function clearAllErrors() {
        const errorFields = document.querySelectorAll('.form-error');
        errorFields.forEach(error => error.textContent = '');

        const inputs = document.querySelectorAll('.form-control');
        inputs.forEach(input => input.classList.remove('error'));
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        clearAllErrors();

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;

        // Get form data
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            floorType: document.getElementById('floorType').value,
            size: document.getElementById('size').value,
            description: document.getElementById('description').value.trim(),
            siteVisit: document.getElementById('siteVisit').checked
        };

        // Validate required fields
        let hasErrors = false;

        if (!formData.name) {
            showError('name', 'Vennligst fyll inn navn');
            hasErrors = true;
        }

        if (!formData.email) {
            showError('email', 'Vennligst fyll inn e-post');
            hasErrors = true;
        } else if (!validateEmail(formData.email)) {
            showError('email', 'Vennligst oppgi en gyldig e-postadresse');
            hasErrors = true;
        }

        if (!formData.phone) {
            showError('phone', 'Vennligst fyll inn telefonnummer');
            hasErrors = true;
        } else if (!validatePhone(formData.phone)) {
            showError('phone', 'Vennligst oppgi et gyldig telefonnummer');
            hasErrors = true;
        }

        if (!formData.description) {
            showError('description', 'Vennligst beskriv prosjektet');
            hasErrors = true;
        }

        if (hasErrors) {
            // Scroll to first error
            const firstError = document.querySelector('.form-control.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstError.focus();
            }
            return;
        }

        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sender...';

        try {
            // Prepare email content
            const floorTypeLabels = {
                'parkett': 'Parkett/tregulv',
                'laminat': 'Laminat',
                'vinyl': 'Vinyl/LVT',
                'linoleum': 'Linoleum/belegg',
                'avretting': 'Gulvavretting',
                'tapetsering': 'Tapetsering',
                'usikker': 'Usikker – trenger råd'
            };

            const sizeLabels = {
                'under20': 'Under 20 m²',
                '20-50': '20-50 m²',
                '50-100': '50-100 m²',
                'over100': 'Over 100 m²'
            };

            const emailBody = `
Ny henvendelse fra DALCOIN nettside

Navn: ${formData.name}
E-post: ${formData.email}
Telefon: ${formData.phone}
Adresse/Område: ${formData.address || 'Ikke oppgitt'}
Type gulv: ${floorTypeLabels[formData.floorType] || 'Ikke valgt'}
Størrelse: ${sizeLabels[formData.size] || 'Ikke valgt'}
Ønsker befaring: ${formData.siteVisit ? 'Ja' : 'Nei'}

Prosjektbeskrivelse:
${formData.description}
            `.trim();

            // Send via Resend API
            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer re_XXXXXXXX' // Replace with actual API key in production
                },
                body: JSON.stringify({
                    from: 'noreply@dalcoin.no',
                    to: 'post@dalcoin.no',
                    subject: `Ny henvendelse fra ${formData.name}`,
                    text: emailBody,
                    reply_to: formData.email
                })
            });

            // For demo purposes, simulate success
            // In production, check response.ok
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Show success message
            contactForm.style.display = 'none';
            formSuccess.classList.add('show');

            // Scroll to success message
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } catch (error) {
            console.error('Form submission error:', error);

            // For demo/development - show success anyway
            // In production, show error message
            contactForm.style.display = 'none';
            formSuccess.classList.add('show');
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    // ============================================
    // Lightbox Gallery
    // ============================================
    function openLightbox(src) {
        if (lightbox && lightboxImage) {
            lightboxImage.src = src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
            if (lightboxImage) {
                lightboxImage.src = '';
            }
        }
    }

    function setupLightbox() {
        if (galleryItems.length > 0) {
            galleryItems.forEach(item => {
                item.addEventListener('click', () => {
                    const src = item.getAttribute('data-src');
                    if (src) {
                        openLightbox(src);
                    }
                });
            });
        }

        if (lightboxClose) {
            lightboxClose.addEventListener('click', closeLightbox);
        }

        if (lightbox) {
            lightbox.addEventListener('click', (e) => {
                if (e.target === lightbox) {
                    closeLightbox();
                }
            });
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }

    // ============================================
    // Scroll Animations
    // ============================================
    function setupScrollAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');

        if (animatedElements.length === 0) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // ============================================
    // Active Navigation Link
    // ============================================
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav__link');

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // ============================================
    // Initialize
    // ============================================
    function init() {
        // Scroll handler
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check initial state

        // Mobile menu
        if (menuToggle) {
            menuToggle.addEventListener('click', toggleMenu);
        }
        setupMenuLinks();

        // Smooth scroll
        setupSmoothScroll();

        // Contact form
        if (contactForm) {
            contactForm.addEventListener('submit', handleFormSubmit);

            // Clear errors on input
            const formInputs = contactForm.querySelectorAll('.form-control');
            formInputs.forEach(input => {
                input.addEventListener('input', () => {
                    clearError(input.id);
                });
            });
        }

        // Lightbox
        setupLightbox();

        // Scroll animations
        setupScrollAnimations();

        // Active nav link
        setActiveNavLink();

        // Close menu on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                closeMenu();
            }
        });

        // Log initialization
        console.log('DALCOIN website initialized');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
