/* =============================================
   PARKAR.IN - GCC Thought Leadership Page JS
   js/page-gcc-thought-leadership.js
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
      // Stagger siblings within the same parent grid/flex container
      const siblings = Array.from(el.parentElement?.querySelectorAll('.fade-up, .fade-in') || []);
      const idx = siblings.indexOf(el);
      if (siblings.length > 1) {
        el.style.transitionDelay = `${idx * 0.09}s`;
      }
      observer.observe(el);
    });
  }

  /* ─── Horizontal drag-scroll for insights track ─── */
  function initDragScroll() {
    const wrap = document.querySelector('.tl-insights-scroll-wrap');
    if (!wrap) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    wrap.addEventListener('mousedown', (e) => {
      isDown = true;
      wrap.style.cursor = 'grabbing';
      startX = e.pageX - wrap.offsetLeft;
      scrollLeft = wrap.scrollLeft;
    });
    wrap.addEventListener('mouseleave', () => {
      isDown = false;
      wrap.style.cursor = 'grab';
    });
    wrap.addEventListener('mouseup', () => {
      isDown = false;
      wrap.style.cursor = 'grab';
    });
    wrap.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - wrap.offsetLeft;
      const walk = (x - startX) * 1.5;
      wrap.scrollLeft = scrollLeft - walk;
    });

    // Touch passthrough is native — no extra code needed
    wrap.style.cursor = 'grab';
  }

  /* ─── Init ─── */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initDragScroll();
  });

})();
