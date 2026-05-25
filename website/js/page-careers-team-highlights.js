/* =============================================
   PARKAR.IN - Team Highlights Page JS
   js/page-careers-team-highlights.js
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

  /* ─── Stars Filter Tabs ─── */
  function initStarsFilter() {
    const tabs = document.querySelectorAll('.th-filter-tab');
    const grid = document.getElementById('thStarsGrid');
    if (!tabs.length || !grid) return;

    const cards = Array.from(grid.querySelectorAll('.th-star-card'));

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.getAttribute('data-filter');

        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Show/hide cards
        cards.forEach(card => {
          const category = card.getAttribute('data-category') || '';
          if (filter === 'all' || category === filter) {
            card.style.display = '';
            // Re-trigger fade
            card.classList.remove('visible');
            requestAnimationFrame(() => {
              requestAnimationFrame(() => card.classList.add('visible'));
            });
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  /* ─── Timeline Scroll (mobile prev/next) ─── */
  function initTimeline() {
    const list = document.getElementById('thTimelineList');
    const prevBtn = document.getElementById('thTimelinePrev');
    const nextBtn = document.getElementById('thTimelineNext');
    if (!list || !prevBtn || !nextBtn) return;

    const entries = Array.from(list.querySelectorAll('.th-timeline-entry'));
    let current = 0;

    function isMobile() { return window.innerWidth <= 960; }

    function updateVisibility() {
      if (!isMobile()) {
        entries.forEach(e => e.style.display = '');
        return;
      }
      entries.forEach((e, i) => {
        e.style.display = i === current ? '' : 'none';
      });
    }

    prevBtn.addEventListener('click', () => {
      if (current > 0) current--;
      updateVisibility();
    });

    nextBtn.addEventListener('click', () => {
      if (current < entries.length - 1) current++;
      updateVisibility();
    });

    window.addEventListener('resize', updateVisibility);
    updateVisibility();
  }

  /* ─── Init ─── */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initStarsFilter();
    initTimeline();
  });

})();
