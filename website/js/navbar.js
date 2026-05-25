/* =============================================
   PARKAR.IN - Navbar Interactions
   js/navbar.js
   ============================================= */

(function () {
  'use strict';

  function initNavbar() {
    const navbar     = document.getElementById('navbar');
    const hamburger  = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    if (!navbar) return; // Component not loaded yet

    /* ---- Scroll: add .scrolled class ---- */
    function onScroll() {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ---- Mobile menu toggle ---- */
    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('open');
        mobileMenu.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        mobileMenu.setAttribute('aria-hidden', String(!isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close on backdrop click
      mobileMenu.addEventListener('click', (e) => {
        if (e.target === mobileMenu) closeMobileMenu();
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeMobileMenu();
      });
    }

    function closeMobileMenu() {
      hamburger?.classList.remove('open');
      mobileMenu?.classList.remove('open');
      hamburger?.setAttribute('aria-expanded', 'false');
      mobileMenu?.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    /* ---- Mobile accordion sub-menus ---- */
    document.querySelectorAll('.mobile-nav-header').forEach(header => {
      header.addEventListener('click', () => {
        const parent = header.closest('.mobile-nav-item');
        const wasOpen = parent.classList.contains('open');

        // Close all open items first
        document.querySelectorAll('.mobile-nav-item.open').forEach(item => {
          item.classList.remove('open');
        });

        if (!wasOpen) parent.classList.add('open');
      });
    });

    /* ---- Desktop dropdown keyboard nav ---- */
    document.querySelectorAll('.nav-link[tabindex="0"]').forEach(link => {
      link.addEventListener('keydown', (e) => {
        const navItem = link.closest('.nav-item');
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          navItem.classList.toggle('open');
        }
        if (e.key === 'Escape') {
          navItem.classList.remove('open');
          link.focus();
        }
      });
    });

    /* ---- Desktop dropdown: hover with delay (prevents accidental close) ---- */
    const closeTimers = new WeakMap();

    document.querySelectorAll('.nav-item').forEach(navItem => {
      if (!navItem.querySelector('.nav-dropdown')) return;

      navItem.addEventListener('mouseenter', () => {
        // Cancel any pending close timer
        if (closeTimers.has(navItem)) {
          clearTimeout(closeTimers.get(navItem));
          closeTimers.delete(navItem);
        }
        // Close other open items
        document.querySelectorAll('.nav-item.open').forEach(other => {
          if (other !== navItem) {
            other.classList.remove('open');
            const otherLink = other.querySelector('.nav-link[aria-expanded]');
            if (otherLink) otherLink.setAttribute('aria-expanded', 'false');
          }
        });
        // Open this item
        navItem.classList.add('open');
        const link = navItem.querySelector('.nav-link[aria-expanded]');
        if (link) link.setAttribute('aria-expanded', 'true');
      });

      navItem.addEventListener('mouseleave', () => {
        const timer = setTimeout(() => {
          navItem.classList.remove('open');
          const link = navItem.querySelector('.nav-link[aria-expanded]');
          if (link) link.setAttribute('aria-expanded', 'false');
          closeTimers.delete(navItem);
        }, 150); // 150ms grace period — enough to move into the dropdown
        closeTimers.set(navItem, timer);
      });
    });
    /* ---- END hover delay ---- */

    // Close desktop dropdowns when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.nav-item')) {
        document.querySelectorAll('.nav-item.open').forEach(item => {
          item.classList.remove('open');
        });
      }
    });

    // Close mobile menu on nav link click
    document.querySelectorAll('.mobile-dropdown-link').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  /* ── Nav CTA icon-swap calc ── */
  function initNavCta() {
    var btn = document.getElementById('navCtaBtn');
    if (!btn) return;
    var icon = btn.querySelector('.nav-cta-icon');
    function calc() {
      var btnW = btn.offsetWidth;
      var iconW = icon.offsetWidth;
      var cs = getComputedStyle(btn);
      var padL = parseFloat(cs.paddingLeft);
      var padR = parseFloat(cs.paddingRight);
      var gap = parseFloat(cs.gap) || 10;
      var move = btnW - padL - padR - iconW;
      btn.style.setProperty('--nav-icon-move', -move + 'px');
      btn.style.setProperty('--nav-text-move', (iconW + gap) + 'px');
    }
    btn.addEventListener('mouseenter', calc);
    window.addEventListener('resize', calc);
    calc();
  }

  // Run after components are loaded
  document.addEventListener('allComponentsLoaded', function() { initNavbar(); initNavCta(); });

  // Fallback: if components were already loaded (e.g., via direct embed)
  if (document.readyState !== 'loading') {
    setTimeout(function() { initNavbar(); initNavCta(); }, 100);
  }

})();
