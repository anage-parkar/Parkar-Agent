/* ============================================================
   PARKAR.IN — Homepage Scripts
   ============================================================ */

(function () {
  'use strict';

  /* ── Counter animation ── */
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      const display = Number.isInteger(target) ? Math.floor(current) : current.toFixed(1);
      el.textContent = display + suffix;
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* ── Intersection Observer — fade-up + counters ── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;

      if (el.classList.contains('stat-num') && el.dataset.target) {
        animateCounter(el);
      }
      if (el.classList.contains('fade-up')) {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }
      observer.unobserve(el);
    });
  }, { threshold: 0.05 });

  /* ── Init fade-up elements ── */
  var gridChildren = new Set();
  document.querySelectorAll('.solutions-grid .fade-up').forEach(function(el) { gridChildren.add(el); });

  document.querySelectorAll('.fade-up').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    if (!gridChildren.has(el)) {
      el.style.transitionDelay = (i % 6) * 0.07 + 's';
      observer.observe(el);
    }
  });

  /* ── Solutions grid: observe the grid, animate ALL children together ── */
  var gridObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      var children = entry.target.querySelectorAll('.fade-up');
      children.forEach(function(child, idx) {
        child.style.transitionDelay = (idx * 0.1) + 's';
        child.style.opacity = '1';
        child.style.transform = 'translateY(0)';
      });
      gridObserver.unobserve(entry.target);
    });
  }, { threshold: 0.02 });
  document.querySelectorAll('.solutions-grid').forEach(function(grid) {
    gridObserver.observe(grid);
  });

  /* ── Observe stat counters ── */
  document.querySelectorAll('.stat-num[data-target]').forEach(el => observer.observe(el));

  /* ── GenAI Tabs (S5) ── */
  function initGenaiTabs() {
    const buttons = document.querySelectorAll('.genai-tab-btn');
    const panels = document.querySelectorAll('.genai-tab-panel');
    if (!buttons.length) return;

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;

        buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
        panels.forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');
        const target = document.getElementById(tabId);
        if (target) target.classList.add('active');
      });
    });
  }

  /* ── Staggered card entry ── */
  function initCardStagger() {
    document.querySelectorAll('.solution-card, .industry-card, .cs-hero-card, .cs-sec-card, .objection-card, .award-card').forEach((card, i) => {
      if (!card.classList.contains('fade-up')) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
        card.classList.add('fade-up');
        observer.observe(card);
      }
    });
  }

  /* ── Awards Carousel ── */
  function initAwardsCarousel() {
    const track = document.getElementById('awardsTrack');
    const prevBtn = document.getElementById('awardsPrev');
    const nextBtn = document.getElementById('awardsNext');
    if (!track || !prevBtn || !nextBtn) return;

    const cards = track.querySelectorAll('.award-card');
    const total = cards.length;
    let current = 0;
    let autoTimer = null;

    function getVisible() {
      const w = window.innerWidth;
      if (w <= 640) return 1;
      if (w <= 900) return 2;
      if (w <= 1100) return 3;
      return 4;
    }

    function getMax() { return Math.max(0, total - getVisible()); }

    function update() {
      current = Math.min(current, getMax());
      const card = cards[0];
      if (!card) return;
      const gap = 24;
      const cardW = card.offsetWidth + gap;
      track.style.transform = `translateX(-${current * cardW}px)`;
    }

    function next() { current = current >= getMax() ? 0 : current + 1; update(); }
    function prev() { current = current <= 0 ? getMax() : current - 1; update(); }

    prevBtn.addEventListener('click', () => { stopAuto(); prev(); startAuto(); });
    nextBtn.addEventListener('click', () => { stopAuto(); next(); startAuto(); });
    window.addEventListener('resize', update);

    // Auto-scroll
    function startAuto() { autoTimer = setInterval(next, 4000); }
    function stopAuto() { clearInterval(autoTimer); }
    startAuto();

    // Pause on hover
    track.closest('.awards-carousel').addEventListener('mouseenter', stopAuto);
    track.closest('.awards-carousel').addEventListener('mouseleave', startAuto);

    // Drag support
    let startX = 0, isDragging = false;
    track.addEventListener('mousedown', (e) => { isDragging = true; startX = e.clientX; stopAuto(); });
    track.addEventListener('mousemove', (e) => { if (isDragging) e.preventDefault(); });
    document.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const diff = startX - e.clientX;
      if (diff > 50) next();
      else if (diff < -50) prev();
      startAuto();
    });
  }

  /* ── CTA Button icon-swap ── */
  function initCtaBtn() {
    var btn = document.getElementById('hpCtaBtn');
    if (!btn) return;
    var icon = btn.querySelector('.hp-cta-icon');

    function calc() {
      var btnW = btn.offsetWidth;
      var iconW = icon.offsetWidth;
      var cs = getComputedStyle(btn);
      var padL = parseFloat(cs.paddingLeft);
      var padR = parseFloat(cs.paddingRight);
      var gap = parseFloat(cs.gap) || 12;
      var move = btnW - padL - padR - iconW;
      btn.style.setProperty('--hp-icon-move', move + 'px');
      btn.style.setProperty('--hp-text-move', -(iconW + gap) + 'px');
    }

    btn.addEventListener('mouseenter', calc);
    window.addEventListener('resize', calc);
    calc();
  }

  /* ── Boot ── */
  document.addEventListener('DOMContentLoaded', () => {
    initGenaiTabs();
    initCardStagger();
    initAwardsCarousel();
    initCtaBtn();
  });

})();
