/* =============================================
   PARKAR.IN — Vector Platform Page Scripts
   js/page-platform.js
   ============================================= */

'use strict';

/* ─── Scroll Reveal ─── */
const platRevealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      platRevealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up, .fade-in').forEach((el, i) => {
  el.style.transitionDelay = (i % 6) * 0.06 + 's';
  platRevealObs.observe(el);
});

/* ─── Stagger card reveal within grids ─── */
function staggerGridCards(gridSelector, childSelector, baseDelay = 0) {
  const grid = document.querySelector(gridSelector);
  if (!grid) return;
  grid.querySelectorAll(childSelector).forEach((card, i) => {
    card.style.transitionDelay = (baseDelay + i * 0.1) + 's';
  });
}

staggerGridCards('.plat-empower-grid', '.plat-emp-card');
staggerGridCards('.plat-support-grid', '.plat-sup-card');
staggerGridCards('.plat-security-grid', '.plat-sec-card');

/* ─── Why Vector blocks — stagger text & card separately ─── */
document.querySelectorAll('.plat-why-block').forEach((block, i) => {
  const text = block.querySelector('.plat-why-text');
  const card = block.querySelector('.plat-why-card');
  if (text) text.style.transitionDelay = '0s';
  if (card) card.style.transitionDelay = '0.15s';
});

/* ─── Hero cards gentle entrance ─── */
document.querySelectorAll('.plat-card').forEach((card, i) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(24px)';
  card.style.transition = `opacity 0.7s ease ${0.4 + i * 0.12}s, transform 0.7s ease ${0.4 + i * 0.12}s, border-color 0.3s ease, box-shadow 0.3s ease`;

  setTimeout(() => {
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
  }, (400 + i * 120));
});

/* ─── Floating icons in hero UDS card ─── */
const floatIcons = document.querySelectorAll('.plat-float-icon');
floatIcons.forEach((icon, i) => {
  icon.style.opacity = '0';
  icon.style.transition = `opacity 0.5s ease ${0.9 + i * 0.08}s`;
  setTimeout(() => { icon.style.opacity = '1'; }, (900 + i * 80));
});

/* ─── Illustration elements entrance ─── */
const illuEles = document.querySelectorAll('.plat-ele');
illuEles.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'scale(0.92)';
  el.style.transition = `opacity 0.5s ease, transform 0.5s ease`;
});

const illuObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const wrap = entry.target;
      const eles = wrap.querySelectorAll('.plat-ele');
      eles.forEach((el, i) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'scale(1)';
        }, i * 80);
      });
      illuObserver.unobserve(wrap);
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.plat-illu-wrap').forEach(wrap => {
  illuObserver.observe(wrap);
});

/* ─── Platform hero cards progress bar animation ─── */
function animateBar() {
  const barImg = document.querySelector('.plat-bar-img');
  if (!barImg) return;
  barImg.style.transform = 'scaleY(0)';
  barImg.style.transformOrigin = 'bottom';
  barImg.style.transition = 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 1s';
  setTimeout(() => {
    barImg.style.transform = 'scaleY(1)';
  }, 600);
}
animateBar();
