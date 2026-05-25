/* =============================================
   PARKAR.IN – Leadership Page JS
   js/page-leadership.js
   Used by: pages/Company/Leadership.html
   =============================================
   Handles:
   1. Scroll-reveal  (fade-up / fade-in)
   2. Leader tab switching + panel crossfade
   3. Keyboard navigation for tabs (ARIA)
   ============================================= */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     1. SCROLL-REVEAL
  ───────────────────────────────────────── */
  function initScrollReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
    );

    document.querySelectorAll('.fade-up, .fade-in').forEach((el) => {
      const parent   = el.parentElement;
      const siblings = parent
        ? Array.from(parent.querySelectorAll(':scope > .fade-up, :scope > .fade-in'))
        : [];

      if (siblings.length > 1) {
        const idx = siblings.indexOf(el);
        if (idx > -1) el.style.transitionDelay = `${idx * 0.1}s`;
      }

      observer.observe(el);
    });
  }


  /* ─────────────────────────────────────────
     2. LEADER TABS — SWITCHING LOGIC
  ───────────────────────────────────────── */
  function initLeaderTabs() {
    const tabs   = Array.from(document.querySelectorAll('.ldr-tab'));
    const panels = Array.from(document.querySelectorAll('.ldr-panel'));

    if (!tabs.length || !panels.length) return;

    /**
     * Activate a specific tab + show its corresponding panel.
     * @param {HTMLElement} targetTab
     */
    function activate(targetTab) {
      const leaderId = targetTab.dataset.leader;
      const targetPanel = document.getElementById('panel-' + leaderId);

      if (!targetPanel) return;

      // ── Tabs: update active state ──
      tabs.forEach((t) => {
        const isActive = t === targetTab;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        t.tabIndex = isActive ? 0 : -1;
      });

      // ── Panels: hide all, show target ──
      panels.forEach((p) => {
        if (p === targetPanel) {
          // Remove hidden attr FIRST so display kicks in, then add active class
          p.removeAttribute('hidden');
          // Force reflow so the animation restarts cleanly
          void p.offsetWidth;
          p.classList.add('active');
        } else {
          p.classList.remove('active');
          // Small delay matches the exit so it's invisible before hidden applies
          setTimeout(() => {
            if (!p.classList.contains('active')) {
              p.setAttribute('hidden', '');
            }
          }, 50);
        }
      });
    }

    // ── Click handler ──
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => activate(tab));
    });

    // ── Keyboard handler (ARIA tabs pattern) ──
    tabs.forEach((tab) => {
      tab.addEventListener('keydown', (e) => {
        let idx = tabs.indexOf(e.currentTarget);

        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
            e.preventDefault();
            idx = (idx + 1) % tabs.length;
            tabs[idx].focus();
            activate(tabs[idx]);
            break;

          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            idx = (idx - 1 + tabs.length) % tabs.length;
            tabs[idx].focus();
            activate(tabs[idx]);
            break;

          case 'Home':
            e.preventDefault();
            tabs[0].focus();
            activate(tabs[0]);
            break;

          case 'End':
            e.preventDefault();
            tabs[tabs.length - 1].focus();
            activate(tabs[tabs.length - 1]);
            break;

          default:
            break;
        }
      });
    });

    // ── Initialise: set correct tabIndex for non-active tabs ──
    tabs.forEach((tab, i) => {
      tab.tabIndex = i === 0 ? 0 : -1;
    });

    // Ensure first panel is visible (in case HTML doesn't have active class)
    const firstActive = tabs.find((t) => t.classList.contains('active'));
    if (firstActive) activate(firstActive);
  }


  /* ─────────────────────────────────────────
     3. STAGGER TAB ENTRANCE
  ───────────────────────────────────────── */
  function initTabStagger() {
    document.querySelectorAll('.ldr-tab').forEach((tab, i) => {
      tab.style.animationDelay = `${i * 0.06}s`;
    });
  }


  /* ─────────────────────────────────────────
     INIT
  ───────────────────────────────────────── */
  function init() {
    initScrollReveal();
    initLeaderTabs();
    initTabStagger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
