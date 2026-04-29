/* ============================================================
   AHMED-REDA SALIMI — Portfolio JS
   Handles: scroll animations, sticky nav, CV tabs, mobile menu
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---- 1. STICKY NAV: Add 'scrolled' class on scroll ----
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ---- 2. MOBILE NAV TOGGLE ----
    const navToggle = document.getElementById('nav-toggle');
    const navLinks  = document.getElementById('nav-links');

    navToggle.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        navToggle.setAttribute('aria-expanded', isOpen);
        // Animate burger to X
        const spans = navToggle.querySelectorAll('span');
        if (isOpen) {
            spans[0].style.transform = 'translateY(7px) rotate(45deg)';
            spans[1].style.opacity   = '0';
            spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
        } else {
            spans[0].style.transform = '';
            spans[1].style.opacity   = '';
            spans[2].style.transform = '';
        }
    });

    // Close mobile nav on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            const spans = navToggle.querySelectorAll('span');
            spans[0].style.transform = '';
            spans[1].style.opacity   = '';
            spans[2].style.transform = '';
        });
    });

    // ---- 3. FADE-IN ON SCROLL (IntersectionObserver) ----
    const fadeEls = document.querySelectorAll('.fade-in');
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    fadeEls.forEach(el => fadeObserver.observe(el));

    // ---- 4. SKILL BAR ANIMATION (trigger on scroll) ----
    const skillFills = document.querySelectorAll('.skill-fill');
    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Apply the animation (CSS keyframe handles it)
                entry.target.style.animation = 'bar-fill 1.2s ease forwards';
                skillObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    skillFills.forEach(el => skillObserver.observe(el));

    // ---- 5. CV TABS ----
    const tabs   = document.querySelectorAll('.cv-tab');
    const panels = document.querySelectorAll('.cv-panel');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetId = tab.dataset.target;

            // Update tabs
            tabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            // Update panels
            panels.forEach(panel => {
                panel.classList.remove('active');
            });
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
                targetPanel.classList.add('active');

                // Re-trigger fade-ins inside newly shown panel
                targetPanel.querySelectorAll('.fade-in').forEach(el => {
                    if (!el.classList.contains('visible')) {
                        el.classList.add('visible');
                    }
                });

                // Re-trigger skill bars animation
                targetPanel.querySelectorAll('.skill-fill').forEach(el => {
                    el.style.animation = 'none';
                    requestAnimationFrame(() => {
                        el.style.animation = 'bar-fill 1.2s ease forwards';
                    });
                });
            }
        });
    });

    // ---- 6. ACTIVE NAV LINK HIGHLIGHTING (on scroll) ----
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinkEls = document.querySelectorAll('.nav-link');

    const activeSectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navLinkEls.forEach(link => {
                    link.style.color = '';
                    if (link.getAttribute('href') === `#${id}`) {
                        link.style.color = 'var(--accent)';
                    }
                });
            }
        });
    }, { threshold: 0.35 });

    sections.forEach(s => activeSectionObserver.observe(s));

    // ---- 7. SMOOTH COUNTER ANIMATION for stat cards ----
    const statNumbers = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseFloat(el.textContent.replace(/[^0-9.]/g, ''));
                const suffix = el.textContent.replace(/[0-9.]/g, '');
                const duration = 1200;
                const start = performance.now();

                const update = (now) => {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out quad
                    const eased = 1 - (1 - progress) * (1 - progress);
                    el.textContent = Math.round(eased * target) + suffix;
                    if (progress < 1) {
                        requestAnimationFrame(update);
                    }
                };

                requestAnimationFrame(update);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.7 });

    statNumbers.forEach(el => counterObserver.observe(el));

    // ---- 8. HERO: Trigger fade-in on load ----
    window.addEventListener('load', () => {
        document.querySelectorAll('#hero .fade-in').forEach(el => {
            el.classList.add('visible');
        });
    });

});
