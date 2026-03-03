// Main JavaScript
// 使用 IIFE 確保即時執行，不依賴 DOMContentLoaded

(function() {
    'use strict';

    // 等待 DOM 就緒（兼容各種載入時機）
    function onReady(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    // ===== i18n 初始化 =====
    onReady(function() {
        try {
            if (window.i18n) window.i18n.init();
        } catch(e) {
            console.warn('i18n init error:', e);
        }
    });

    // ===== Mobile Menu =====
    onReady(function() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => mobileMenu.classList.add('hidden'));
            });
        }
    });

    // ===== Smooth Scroll =====
    onReady(function() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    });

    // ===== Contact Form（獨立初始化，不受其他模組影響） =====
    onReady(function() {
        const contactForm = document.getElementById('contact-form');
        const formStatus = document.getElementById('form-status');

        if (!contactForm || !formStatus) {
            console.warn('Contact form or status element not found');
            return;
        }

        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();

            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                company: formData.get('company') || '',
                product: formData.get('product'),
                message: formData.get('message'),
                _subject: '[Timux 官網] ' + formData.get('product') + ' 詢問 - ' + formData.get('name'),
                _template: 'table'
            };

            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="animate-pulse">⏳ 發送中...</span>';
            submitBtn.disabled = true;

            try {
                // FormSubmit.co — 免費表單服務
                const response = await fetch('https://formsubmit.co/ajax/contact@timux.site', {
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
                    formStatus.innerHTML = '<div class="flex items-center justify-center gap-2 mb-2"><span class="text-2xl">✅</span><span class="text-lg font-semibold">訊息已成功送出！</span></div><p class="text-gray-400">我們會在 24 小時內回覆您的 <strong>' + data.email + '</strong></p>';
                    formStatus.className = 'mt-4 text-center text-sm text-green-400 p-4 glass rounded-xl';
                    formStatus.classList.remove('hidden');
                    contactForm.reset();
                    saveLocal(data);
                    setTimeout(function() { formStatus.classList.add('hidden'); }, 8000);
                } else {
                    // FormSubmit 需要激活或其他問題 — 使用備用方案
                    throw new Error(result.message || '表單需要激活');
                }

            } catch (error) {
                console.warn('FormSubmit error:', error.message);
                
                // 備用方案: mailto
                var subject = encodeURIComponent(data._subject);
                var body = encodeURIComponent('姓名：' + data.name + '\n郵件：' + data.email + '\n公司：' + (data.company || '無') + '\n產品：' + data.product + '\n\n訊息：\n' + data.message + '\n\n---\n來自 Timux 官網聯繫表單');
                var mailtoLink = 'mailto:contact@timux.site?subject=' + subject + '&body=' + body;
                
                formStatus.innerHTML = '<div class="flex items-center justify-center gap-2 mb-2"><span class="text-2xl">📧</span><span class="text-lg font-semibold">請透過郵件聯繫我們</span></div><p class="text-gray-400 mb-3">自動發送暫時無法使用，請點擊下方按鈕：</p><a href="' + mailtoLink + '" class="inline-block gradient-bg px-6 py-2 rounded-lg font-semibold hover:opacity-90 transition text-white">📧 開啟郵件發送</a><p class="text-gray-500 text-xs mt-2">或直接寄到 contact@timux.site</p>';
                formStatus.className = 'mt-4 text-center text-sm text-amber-400 p-4 glass rounded-xl';
                formStatus.classList.remove('hidden');
                saveLocal(data);
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });

        console.log('📋 Contact form handler attached');
    });

    // ===== 本地存儲備份 =====
    function saveLocal(data) {
        try {
            var submissions = JSON.parse(localStorage.getItem('timux-inquiries') || '[]');
            submissions.push({
                name: data.name,
                email: data.email,
                company: data.company,
                product: data.product,
                message: data.message,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('timux-inquiries', JSON.stringify(submissions));
            console.log('📋 表單已備份到 localStorage，共', submissions.length, '筆');
        } catch (e) {
            console.warn('localStorage save failed:', e);
        }
    }

    // ===== Navbar Scroll =====
    onReady(function() {
        var nav = document.querySelector('nav');
        if (nav) {
            window.addEventListener('scroll', function() {
                if (window.scrollY > 50) {
                    nav.classList.add('bg-dark/80');
                } else {
                    nav.classList.remove('bg-dark/80');
                }
            });
        }
    });

    // ===== Fade-in Animations =====
    onReady(function() {
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('section').forEach(function(section) {
            section.style.opacity = '0';
            section.style.transform = 'translateY(20px)';
            section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(section);
        });

        var style = document.createElement('style');
        style.textContent = '.animate-fade-in { opacity: 1 !important; transform: translateY(0) !important; }';
        document.head.appendChild(style);
    });

    console.log('🚀 Timux main.js loaded');
})();
