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

            // 直接使用 mailto 方案（最可靠）
            const mailtoLink = `mailto:bigheadian1166@gmail.com?subject=${encodeURIComponent(`[Timux 官網] ${data.product} 詢問 - ${data.name}`)}&body=${encodeURIComponent(`姓名：${data.name}\n郵件：${data.email}\n公司：${data.company || '無'}\n產品：${data.product}\n\n訊息：\n${data.message}\n\n---\n此訊息來自 Timux 官網聯繫表單 (www.timux.site)`)}`;
            
            // 自動開啟郵件客戶端
            window.location.href = mailtoLink;
            
            // 顯示成功提示
            formStatus.innerHTML = `
                ✅ 已自動開啟您的郵件軟體！<br>
                <small class="text-gray-400 mt-1 block">
                如未自動開啟，請手動發送郵件至：<br>
                <code class="text-primary">bigheadian1166@gmail.com</code>
                </small>
            `;
            formStatus.className = 'mt-4 text-center text-sm text-green-400';
            formStatus.classList.remove('hidden');
            
            // 清空表單
            setTimeout(() => {
                contactForm.reset();
            }, 1000);
            
            // 5秒後隱藏訊息
            setTimeout(() => {
                formStatus.classList.add('hidden');
            }, 6000); finally {
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
