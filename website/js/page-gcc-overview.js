/* =============================================
   PARKAR.IN - GCC Overview Page JS
   js/page-gcc-overview.js
   ============================================= */

(function () {
  'use strict';

  /* ─── Scroll-reveal (IntersectionObserver) ─── */
  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('.fade-up, .fade-in').forEach((el, i) => {
      // stagger siblings inside a grid by their index
      const siblings = el.parentElement?.querySelectorAll('.fade-up, .fade-in');
      if (siblings && siblings.length > 1) {
        const idx = Array.from(siblings).indexOf(el);
        el.style.transitionDelay = `${idx * 0.08}s`;
      }
      observer.observe(el);
    });
  }

  /* ─── 90-Day Carousel ─── */
  function initCarousel() {
    const track    = document.getElementById('carouselTrack');
    const slides   = document.querySelectorAll('.carousel-slide');
    const dots     = document.querySelectorAll('.carousel-dot');
    const btnPrev  = document.getElementById('carouselPrev');
    const btnNext  = document.getElementById('carouselNext');

    if (!track || slides.length === 0) return;

    let current = 0;
    const total = slides.length;

    function goTo(idx) {
      current = (idx + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === current));
    }

    btnPrev?.addEventListener('click', () => goTo(current - 1));
    btnNext?.addEventListener('click', () => goTo(current + 1));
    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    // Auto-advance every 5s
    let timer = setInterval(() => goTo(current + 1), 5000);
    track.closest('.carousel-wrapper')?.addEventListener('mouseenter', () => clearInterval(timer));
    track.closest('.carousel-wrapper')?.addEventListener('mouseleave', () => {
      timer = setInterval(() => goTo(current + 1), 5000);
    });

    // Touch/swipe support
    let startX = 0;
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    });

    goTo(0); // init
  }

  /* ─── Run after DOM ready ─── */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initCarousel();
  });

})();
