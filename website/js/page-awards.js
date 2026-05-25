/* =============================================
   PARKAR.IN – Awards & Recognitions Page JS
   js/page-awards.js
   Used by: pages/Company/AwardsRecognitions.html
   ============================================= */

(function () {
  'use strict';

  /* ─── Scroll-reveal (fade-up / fade-in) ─── */
  function initScrollReveal() {
    const els = document.querySelectorAll('.fade-up, .fade-in');
    if (!els.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    els.forEach((el) => io.observe(el));
  }

  /* ─── Staggered card entrance ─── */
  function initCardStagger() {
    const cards = document.querySelectorAll('.ar-card, .ar-webinar-card');
    cards.forEach((card, i) => {
      card.style.transitionDelay = `${(i % 3) * 80}ms`;
    });
  }

  /* ─── Init ─── */
  function init() {
    initScrollReveal();
    initCardStagger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
