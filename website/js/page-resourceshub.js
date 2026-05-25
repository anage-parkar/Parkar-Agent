/* =============================================
   PARKAR.IN – Resource Centre JS
   js/page-ResourcesHub.js
   ============================================= */

(function () {
  'use strict';

  function init() {

    /* ── 1. Scroll Reveal ── */
    var revealObserver;
    var revealEls = document.querySelectorAll('.reveal');
    if (revealEls.length && 'IntersectionObserver' in window) {
      revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
      );
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    } else {
      // Fallback: just show everything
      revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ── 2. Tab Switching (ResourcesHub) ── */
    var tabBtns  = document.querySelectorAll('.rc-tab-btn');
    var tabPanes = document.querySelectorAll('.rc-tab-pane');

    tabBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-tab');

        tabBtns.forEach(function (b) { b.classList.remove('active'); });
        tabPanes.forEach(function (p) { p.classList.remove('active'); });

        btn.classList.add('active');
        var pane = document.getElementById('tab-' + target);
        if (pane) {
          pane.classList.add('active');
          if (revealObserver) {
            pane.querySelectorAll('.reveal:not(.visible)').forEach(function (el) {
              revealObserver.observe(el);
            });
          }
        }
      });
    });

    /* ── 3. Category Filter Pills — handled by inline script on insights.html ── */
    /* The inline script coordinates filter + Load More + rc-hidden state */
  }

  // Run immediately since script is at bottom of body,
  // but also handle case where DOM isn't ready yet
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
