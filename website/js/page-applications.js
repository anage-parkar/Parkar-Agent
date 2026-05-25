/* =============================================
   PARKAR.IN - Applications Page Scripts
   js/page-applications.js
   ============================================= */

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up, .fade-in').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.08 + 's';
  observer.observe(el);
});

// Accordion
function toggleAccordion(header) {
  const item = header.closest('.accordion-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// Counter animation
function animateCounters() {
  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    let current = 0;
    const step = target / (1800 / 16);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + '%';
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}
const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) { animateCounters(); statsObserver.disconnect(); }
}, { threshold: 0.3 });
const statsEl = document.querySelector('.stats');
if (statsEl) statsObserver.observe(statsEl);

// GSAP hero ellipse
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  gsap.to('#heroEllipse', {
    rotation: 720,
    ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 }
  });
}
