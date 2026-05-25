/* =============================================
   PARKAR.IN - Cloud Engineering & Infrastructure
   js/page-cloud.js
   ============================================= */

// ─── Scroll Reveal ───
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up, .fade-in').forEach((el, i) => {
  el.style.transitionDelay = (i % 6) * 0.06 + 's';
  observer.observe(el);
});

// ─── Anchor Navigation — show/hide on scroll ───
(function initAnchorNav() {
  const anchorNav = document.getElementById('anchorNav');
  const hero = document.getElementById('hero');
  if (!anchorNav || !hero) return;

  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        anchorNav.classList.remove('visible');
      } else {
        anchorNav.classList.add('visible');
      }
    });
  }, { threshold: 0, rootMargin: '-80px 0px 0px 0px' });

  heroObserver.observe(hero);

  // Smooth scroll for anchor links
  anchorNav.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        const offset = 56; // anchor nav height
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // Active link tracking
  const sections = [];
  anchorNav.querySelectorAll('a[href^="#"]').forEach(link => {
    const id = link.getAttribute('href').substring(1);
    const section = document.getElementById(id);
    if (section) sections.push({ link, section });
  });

  function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    let active = null;

    sections.forEach(({ link, section }) => {
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        active = link;
      }
    });

    sections.forEach(({ link }) => link.classList.remove('active'));
    if (active) active.classList.add('active');
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();

// ─── Capability Card Toggle ───
function toggleCapCard(btn) {
  const card = btn.closest('.cld-cap-card');
  card.classList.toggle('expanded');
}

// ─── Smooth scroll for hero secondary CTA ───
document.querySelectorAll('a[href^="#"]').forEach(link => {
  if (link.closest('.cld-anchor-nav')) return; // already handled
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href.startsWith('#') && href.length > 1) {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const offset = 56;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  });
});

// ─── GSAP Hero Ellipse ───
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  gsap.to('#heroEllipse', {
    rotation: 720,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: 0.5
    }
  });
}
