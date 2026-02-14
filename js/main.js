// Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize i18n
    if (window.i18n) {
        window.i18n.init();
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Close menu when clicking a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Contact form handling
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company'),
                product: formData.get('product'),
                message: formData.get('message')
            };

            // Get current language for messages
            const lang = localStorage.getItem('timux-lang') || 'zh-TW';
            const t = window.i18n?.translations[lang] || {};

            // Show loading state
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="animate-pulse">⏳</span>';
            submitBtn.disabled = true;

            try {
                // Use Formspree for form handling (free tier)
                // You can replace this with your own endpoint
                const response = await fetch('https://formspree.io/f/xkgnnwpz', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        ...data,
                        _replyto: data.email,
                        _subject: `[Timux Website] 來自 ${data.name} 的詢問 - ${data.product}`
                    })
                });

                if (response.ok) {
                    // Success
                    formStatus.textContent = t['contact.success'] || 'Message sent successfully!';
                    formStatus.className = 'mt-4 text-center text-sm text-green-400';
                    formStatus.classList.remove('hidden');
                    contactForm.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                // Fallback: mailto link
                const mailtoLink = `mailto:bigheadian1166@gmail.com?subject=${encodeURIComponent(`[Timux] 來自 ${data.name} 的詢問`)}&body=${encodeURIComponent(`姓名: ${data.name}\n郵件: ${data.email}\n公司: ${data.company || 'N/A'}\n產品: ${data.product}\n\n訊息:\n${data.message}`)}`;
                
                formStatus.innerHTML = `${t['contact.error'] || 'Failed to send.'} <a href="${mailtoLink}" class="underline text-primary">點擊這裡使用郵件發送</a>`;
                formStatus.className = 'mt-4 text-center text-sm text-yellow-400';
                formStatus.classList.remove('hidden');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // Navbar background on scroll
    const nav = document.querySelector('nav');
    if (nav) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('bg-dark/80');
            } else {
                nav.classList.remove('bg-dark/80');
            }
        });
    }

    // Intersection Observer for fade-in animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    // Add animation class
    const style = document.createElement('style');
    style.textContent = `
        .animate-fade-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    `;
    document.head.appendChild(style);

    console.log('🚀 Timux website initialized');
});
