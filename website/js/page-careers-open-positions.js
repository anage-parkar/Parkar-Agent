/* =============================================
   PARKAR.IN - Open Positions Page JS
   js/page-careers-open-positions.js
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

  /* ─── Job Search & Filter ─── */
  function initFilters() {
    const searchInput = document.getElementById('opSearchInput');
    const deptFilter = document.getElementById('opDeptFilter');
    const locFilter = document.getElementById('opLocFilter');
    const jobsList = document.getElementById('opJobsList');
    const emptyState = document.getElementById('opEmptyState');

    if (!searchInput || !deptFilter || !locFilter || !jobsList) return;

    const cards = Array.from(jobsList.querySelectorAll('.op-job-card'));

    function filter() {
      const query = searchInput.value.toLowerCase().trim();
      const dept = deptFilter.value.toLowerCase();
      const loc = locFilter.value.toLowerCase();

      let visibleCount = 0;

      cards.forEach(card => {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        const cardDept = (card.getAttribute('data-dept') || '').toLowerCase();
        const cardLoc = (card.getAttribute('data-loc') || '').toLowerCase();

        const matchSearch = !query || title.includes(query);
        const matchDept = !dept || cardDept === dept;
        const matchLoc = !loc || cardLoc === loc;

        if (matchSearch && matchDept && matchLoc) {
          card.style.display = '';
          visibleCount++;
        } else {
          card.style.display = 'none';
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('visible', visibleCount === 0);
      }
    }

    searchInput.addEventListener('input', filter);
    deptFilter.addEventListener('change', filter);
    locFilter.addEventListener('change', filter);
  }

  /* ─── Load More (internal — scrolls to top of listings) ─── */
  function initLoadMore() {
    const btn = document.getElementById('opLoadMoreBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const listings = document.querySelector('#example-widget-container, .op-jobs-list, .op-listings');
      if (listings) listings.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ─── Init ─── */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initFilters();
    initLoadMore();
  });

})();
