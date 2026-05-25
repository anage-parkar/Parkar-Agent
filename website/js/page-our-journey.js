/* =============================================
   PARKAR.IN – Our Journey Page JS
   js/page-our-journey.js
   Used by: pages/Company/OurJourney.html
   ============================================= */

'use strict';

/* ── 1. Scroll-reveal (IntersectionObserver) ── */
function initReveal() {
  const els = document.querySelectorAll('.fade-up, .fade-in');
  if (!els.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        /* Stagger siblings at the same nesting level */
        const siblings = Array.from(
          (el.parentElement || document).querySelectorAll('.fade-up, .fade-in')
        ).filter((s) => s.parentElement === el.parentElement);
        const idx = siblings.indexOf(el);
        if (idx > 0) {
          el.style.transitionDelay = idx * 0.08 + 's';
        }

        el.classList.add('visible');
        observer.unobserve(el);
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
  );

  els.forEach((el) => observer.observe(el));
}

/* ── 2. Year tab interaction ── */
function initYearTabs() {
  const tabs   = document.querySelectorAll('.oj-year-tab');
  const panels = document.querySelectorAll('.oj-history-panel');
  if (!tabs.length) return;

  function activateYear(year) {
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.year === year));
    panels.forEach((p) => p.classList.toggle('active', p.dataset.panel === year));
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const year = tab.dataset.year;
      activateYear(year);
      /* Scroll active tab into view on mobile */
      tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });
  });

  /* Activate first tab by default */
  if (tabs[0]) activateYear(tabs[0].dataset.year);
}

/* ── 3. Value card – touch-friendly hover fallback ── */
function initValueCards() {
  /* On touch devices CSS :hover doesn't persist;
     toggle a class on tap so the overlay stays visible. */
  const cards = document.querySelectorAll('.oj-value-card');
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      cards.forEach((c) => { if (c !== card) c.classList.remove('tapped'); });
      card.classList.toggle('tapped');
    });
  });
}

/* ── 4. Why Parkar – animate connecting line on scroll ── */
function initWhyLine() {
  const lineInner = document.querySelector('.oj-why-line-inner');
  if (!lineInner) return;

  const section = document.querySelector('.oj-why');
  if (!section) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          lineInner.style.transition = 'height 1.2s ease';
          lineInner.style.height = '100%';
          observer.unobserve(section);
        }
      });
    },
    { threshold: 0.05 }
  );

  /* Start at 0 height so the animation plays on scroll-in */
  lineInner.style.height = '0%';
  observer.observe(section);
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initYearTabs();
  initValueCards();
  initWhyLine();
});
