/* =============================================
   PARKAR.IN - Legal Pages JS
   js/page-legal.js
   ============================================= */

(function () {
  'use strict';

  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('.fade-up, .fade-in').forEach((el) => {
      observer.observe(el);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
  });

})();
