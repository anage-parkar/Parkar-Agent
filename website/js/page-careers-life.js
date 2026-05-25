/* =============================================
   PARKAR.IN - Life at Parkar Page JS
   js/page-careers-life.js
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

  /* ─── Hero Carousel ─── */
  function initHeroCarousel() {
    const slides = document.getElementById('lapHeroSlides');
    const dots = document.querySelectorAll('#lapHeroDots .lap-hero-dot');
    if (!slides || !dots.length) return;

    const total = dots.length;
    let current = 0;
    let timer = null;

    function goTo(idx) {
      dots[current].classList.remove('active');
      current = (idx + total) % total;
      slides.style.transform = `translateX(-${current * 100}%)`;
      dots[current].classList.add('active');
    }

    function startAuto() {
      timer = setInterval(() => goTo(current + 1), 5000);
    }

    function stopAuto() {
      clearInterval(timer);
    }

    // Dot click
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        stopAuto();
        goTo(i);
        startAuto();
      });
    });

    // Pause on hover
    slides.addEventListener('mouseenter', stopAuto);
    slides.addEventListener('mouseleave', startAuto);

    startAuto();
  }

  /* ─── Testimonials Slider ─── */
  function initTestimonials() {
    const track = document.getElementById('lapTestiTrack');
    const prevBtn = document.getElementById('lapTestiPrev');
    const nextBtn = document.getElementById('lapTestiNext');
    if (!track || !prevBtn || !nextBtn) return;

    const cards = track.querySelectorAll('.lap-testi-card');
    const total = cards.length;
    let current = 0;

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, total - 1));
      track.style.transform = `translateX(-${current * 100}%)`;
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    // Auto-advance every 6 seconds
    let autoTimer = setInterval(() => goTo((current + 1) % total), 6000);
    track.closest('.lap-testi-wrapper').addEventListener('mouseenter', () => clearInterval(autoTimer));
    track.closest('.lap-testi-wrapper').addEventListener('mouseleave', () => {
      autoTimer = setInterval(() => goTo((current + 1) % total), 6000);
    });
  }

  /* ─── Benefits Accordion ─── */
  function initAccordion() {
    const accordion = document.getElementById('lapAccordion');
    if (!accordion) return;

    accordion.querySelectorAll('.lap-accordion-item').forEach(item => {
      const header = item.querySelector('.lap-accordion-header');
      if (!header) return;

      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all
        accordion.querySelectorAll('.lap-accordion-item.open').forEach(openItem => {
          openItem.classList.remove('open');
          openItem.querySelector('.lap-accordion-header').setAttribute('aria-expanded', 'false');
          const minus = openItem.querySelector('.icon-minus');
          const plus = openItem.querySelector('.icon-plus');
          if (minus) minus.style.display = 'none';
          if (plus) plus.style.display = '';
        });

        // Open clicked if it was closed
        if (!isOpen) {
          item.classList.add('open');
          header.setAttribute('aria-expanded', 'true');
          const minus = item.querySelector('.icon-minus');
          const plus = item.querySelector('.icon-plus');
          if (minus) minus.style.display = '';
          if (plus) plus.style.display = 'none';
        }
      });

      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          header.click();
        }
      });
    });
  }

  /* ─── Location Tabs ─── */
  function initLocationTabs() {
    const tabs = document.querySelectorAll('.lap-loc-tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const panelId = tab.getAttribute('data-panel');

        // Update tabs
        tabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Update panels
        document.querySelectorAll('.lap-loc-panel').forEach(panel => {
          panel.classList.remove('active');
        });
        const target = document.getElementById(`panel-${panelId}`);
        if (target) target.classList.add('active');
      });
    });
  }

  /* ─── Init ─── */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initHeroCarousel();
    initTestimonials();
    initAccordion();
    initLocationTabs();
  });

})();
