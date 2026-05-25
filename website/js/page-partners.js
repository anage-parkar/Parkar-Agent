/* =============================================
   PARKAR.IN – Partners Page JS
   js/page-partners.js
   Used by: pages/Company/Partners.html
   ============================================= */

(function () {
  'use strict';

  /* ─── 1. Scroll-reveal (fade-up / fade-in) ─── */
  function initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );

    document.querySelectorAll('.fade-up, .fade-in').forEach((el) => {
      const parent   = el.parentElement;
      const siblings = parent
        ? Array.from(parent.querySelectorAll(':scope > .fade-up, :scope > .fade-in'))
        : [];

      if (siblings.length > 1) {
        const idx = siblings.indexOf(el);
        if (idx > -1) el.style.transitionDelay = `${idx * 0.08}s`;
      }

      observer.observe(el);
    });
  }

  /* ─── 2. Stagger alliance cards ─── */
  function initAllianceStagger() {
    document.querySelectorAll('.partner-alliance-card').forEach((card, i) => {
      card.style.transitionDelay = `${(i % 2) * 80}ms`;
    });
    document.querySelectorAll('.partner-why-card').forEach((card, i) => {
      card.style.transitionDelay = `${i * 75}ms`;
    });
  }

  /* ─── 3. Contact form ─── */
  function initForm() {
    const form    = document.getElementById('partner-join-form');
    const success = document.querySelector('.form-success');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // In production this would post to a real endpoint.
      // For the static clone we just show the success message.
      form.style.display = 'none';
      if (success) success.classList.add('visible');
    });
  }

  /* ─── Init ─── */
  function init() {
    initScrollReveal();
    initAllianceStagger();
    initForm();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
