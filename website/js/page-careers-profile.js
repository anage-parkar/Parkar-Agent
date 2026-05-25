/* =============================================
   PARKAR.IN - Team Highlight Profile Page JS
   js/page-careers-profile.js
   ============================================= */

(function () {
  'use strict';

  /* ─── Scroll-reveal via IntersectionObserver ─── */
  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('.fade-up, .fade-in').forEach((el) => {
      const siblings = Array.from(
        el.parentElement?.querySelectorAll(':scope > .fade-up, :scope > .fade-in') || []
      );
      const idx = siblings.indexOf(el);
      if (siblings.length > 1) {
        el.style.transitionDelay = `${idx * 0.09}s`;
      }
      observer.observe(el);
    });
  }

  /* ─── Init ─── */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
  });

})();
