/* =============================================
   PARKAR.IN - Main Page Scripts
   js/main.js
   ============================================= */

(function () {
  'use strict';

  /* ---- Utility: throttle ---- */
  function throttle(fn, delay) {
    let last = 0;
    return function (...args) {
      const now = Date.now();
      if (now - last >= delay) { last = now; fn.apply(this, args); }
    };
  }

  /* =============================================
     REVEAL ON SCROLL (Intersection Observer)
     ============================================= */
  function initReveal() {
    const elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
  }

  /* =============================================
     COUNTER ANIMATION
     ============================================= */
  function animateCounter(el, target, suffix, duration) {
    let start = 0;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  function initCounters() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el      = entry.target;
          const target  = parseInt(el.dataset.target, 10);
          const suffix  = el.dataset.suffix || '';
          animateCounter(el, target, suffix, 2000);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));
  }

  /* =============================================
     CASE STUDIES HORIZONTAL SCROLL
     ============================================= */
  function initCaseStudiesScroll() {
    const scrollContainer = document.querySelector('.case-studies-scroll');
    const prevBtn = document.querySelector('.scroll-btn.prev');
    const nextBtn = document.querySelector('.scroll-btn.next');

    if (!scrollContainer) return;

    const scrollAmount = 360;

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      });
    }

    // Touch/drag scroll
    let isDown = false, startX, scrollLeft;

    scrollContainer.addEventListener('mousedown', e => {
      isDown = true;
      scrollContainer.style.cursor = 'grabbing';
      startX = e.pageX - scrollContainer.offsetLeft;
      scrollLeft = scrollContainer.scrollLeft;
    });

    scrollContainer.addEventListener('mouseleave', () => {
      isDown = false;
      scrollContainer.style.cursor = '';
    });

    scrollContainer.addEventListener('mouseup', () => {
      isDown = false;
      scrollContainer.style.cursor = '';
    });

    scrollContainer.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 1.5;
      scrollContainer.scrollLeft = scrollLeft - walk;
    });
  }

  /* =============================================
     PARTNER LOGOS MARQUEE PAUSE ON HOVER
     ============================================= */
  function initMarqueePause() {
    const track = document.querySelector('.partners-logos-track');
    if (!track) return;
    const wrap = track.closest('.partners-logos-wrap');
    if (!wrap) return;

    wrap.addEventListener('mouseenter', () => {
      track.style.animationPlayState = 'paused';
    });
    wrap.addEventListener('mouseleave', () => {
      track.style.animationPlayState = 'running';
    });
  }

  /* =============================================
     HERO BAR CHART ANIMATION
     ============================================= */
  function initHeroBars() {
    const bars = document.querySelectorAll('.hero-bar');
    const heights = [40, 65, 35, 80, 55, 90, 70, 45, 85, 60];
    bars.forEach((bar, i) => {
      bar.style.height = '0%';
      setTimeout(() => {
        bar.style.height = (heights[i % heights.length] || 50) + '%';
      }, 600 + i * 80);
    });
  }

  /* =============================================
     SMOOTH SCROLL for anchor links
     ============================================= */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height'));
          const top = target.getBoundingClientRect().top + window.scrollY - (navHeight || 80) - 20;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* =============================================
     INIT ALL
     ============================================= */
  function init() {
    initReveal();
    initCounters();
    initCaseStudiesScroll();
    initMarqueePause();
    initHeroBars();
    initSmoothScroll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Also run after components are injected (for elements inside navbar/footer)
  document.addEventListener('allComponentsLoaded', init);

})();
