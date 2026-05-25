/* =============================================
   PARKAR.IN - Media & Hi-Tech Page Scripts
   js/page-media.js
   ============================================= */

// ─── Scroll Reveal ───
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up, .fade-in').forEach((el, i) => {
  el.style.transitionDelay = (i % 4) * 0.08 + 's';
  revealObserver.observe(el);
});

// ─── Accordion ───
function toggleAccordion(header) {
  const item = header.closest('.accordion-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ─── Testimonials Carousel ───
(function () {
  const cards = document.querySelectorAll('.testimonial-card');
  let current = 0;

  function showCard(index) {
    cards.forEach(c => c.classList.remove('active'));
    cards[index].classList.add('active');
  }

  const prevBtn = document.querySelector('.arrow-left-wp-1');
  const nextBtn = document.querySelector('.arrow-right-wp-1');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      current = (current - 1 + cards.length) % cards.length;
      showCard(current);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      current = (current + 1) % cards.length;
      showCard(current);
    });
  }
})();

// ─── Stats Sub-Slider ───
(function () {
  const slides = document.querySelectorAll('.stats-slide');
  if (!slides.length) return;
  let current = 0;

  function showSlide(index) {
    slides.forEach(s => s.classList.remove('active'));
    slides[index].classList.add('active');
  }

  const prevBtn = document.querySelector('.arrow-left-wp-1');
  const nextBtn = document.querySelector('.arrow-right-wp-1');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      current = (current - 1 + slides.length) % slides.length;
      showSlide(current);
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      current = (current + 1) % slides.length;
      showSlide(current);
    });
  }
})();

// ─── Counter Animation ───
function animateCounters() {
  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    let current = 0;
    const duration = 1800;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = Math.floor(current) + '%';
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    animateCounters();
    statsObserver.disconnect();
  }
}, { threshold: 0.3 });

const statsSection = document.querySelector('.stats');
if (statsSection) statsObserver.observe(statsSection);
