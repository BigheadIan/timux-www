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
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ===== Contact Form =====
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company') || '',
                product: formData.get('product'),
                message: formData.get('message'),
                _subject: `[Timux 官網] ${formData.get('product')} 詢問 - ${formData.get('name')}`,
                _template: 'table'
            };

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="animate-pulse">⏳ 發送中...</span>';
            submitBtn.disabled = true;

            try {
                // 方案 1: FormSubmit.co — 免費、可靠、不需後端
                const response = await fetch('https://formsubmit.co/ajax/bigheadian1166@gmail.com', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success === 'true' || result.success === true) {
                    // ✅ 成功
                    formStatus.innerHTML = `
                        <div class="flex items-center justify-center gap-2 mb-2">
                            <span class="text-2xl">✅</span>
                            <span class="text-lg font-semibold">訊息已成功送出！</span>
                        </div>
                        <p class="text-gray-400">我們會在 24 小時內回覆您的 <strong>${data.email}</strong></p>
                    `;
                    formStatus.className = 'mt-4 text-center text-sm text-green-400 p-4 glass rounded-xl';
                    formStatus.classList.remove('hidden');
                    contactForm.reset();

                    // 記錄到 localStorage 備份
                    saveSubmissionLocally(data);

                    setTimeout(() => { formStatus.classList.add('hidden'); }, 8000);
                } else {
                    throw new Error(result.message || '表單提交失敗');
                }

            } catch (error) {
                console.error('Form error:', error);
                
                // 備用方案: mailto
                const mailtoLink = `mailto:bigheadian1166@gmail.com?subject=${encodeURIComponent(data._subject)}&body=${encodeURIComponent(`姓名：${data.name}\n郵件：${data.email}\n公司：${data.company || '無'}\n產品：${data.product}\n\n訊息：\n${data.message}\n\n---\n來自 Timux 官網聯繫表單`)}`;
                
                formStatus.innerHTML = `
                    <div class="flex items-center justify-center gap-2 mb-2">
                        <span class="text-2xl">📧</span>
                        <span class="text-lg font-semibold">請透過郵件聯繫我們</span>
                    </div>
                    <p class="text-gray-400 mb-3">自動發送暫時無法使用，請點擊下方按鈕：</p>
                    <a href="${mailtoLink}" class="inline-block gradient-bg px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition">
                        📧 開啟郵件發送
                    </a>
                    <p class="text-gray-500 text-xs mt-2">或直接寄到 bigheadian1166@gmail.com</p>
                `;
                formStatus.className = 'mt-4 text-center text-sm text-amber-400 p-4 glass rounded-xl';
                formStatus.classList.remove('hidden');

                // 仍然記錄到 localStorage
                saveSubmissionLocally(data);
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }

    // 記錄提交到 localStorage（備份）
    function saveSubmissionLocally(data) {
        try {
            const submissions = JSON.parse(localStorage.getItem('timux-inquiries') || '[]');
            submissions.push({
                ...data,
                timestamp: new Date().toISOString(),
                _subject: undefined,
                _template: undefined
            });
            localStorage.setItem('timux-inquiries', JSON.stringify(submissions));
            console.log('📋 表單已備份到 localStorage，共', submissions.length, '筆');
        } catch (e) {
            console.warn('localStorage 備份失敗:', e);
        }
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
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
    });

    const style = document.createElement('style');
    style.textContent = `.animate-fade-in { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);

    console.log('🚀 Timux website initialized');
});
