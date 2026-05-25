/* =============================================
   PARKAR.IN - AIONIQ Page Script
   js/page-aioniq.js
   Neural network canvas + GSAP scroll animations
   ============================================= */

(function () {
  'use strict';

  /* ─── Neural Network Canvas ─── */
  const canvas = document.getElementById('aiq-neural-network');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() { this.reset(); }

    reset() {
      this.x      = Math.random() * canvas.width;
      this.y      = Math.random() * canvas.height;
      this.vx     = (Math.random() - 0.5) * 0.5;
      this.vy     = (Math.random() - 0.5) * 0.5;
      this.radius = Math.random() * 2 + 1;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width)  this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height)  this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 217, 255, 0.5)';
      ctx.fill();
    }
  }

  const particles = [];
  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 217, 255, ${0.2 * (1 - dist / 150)})`;
          ctx.lineWidth   = 1;
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    connectParticles();
    requestAnimationFrame(animate);
  }
  animate();

  /* ─── GSAP Scroll Animations ─── */
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // Problem cards — trigger all from parent section, not individually
  var probSection = document.querySelector('.aiq-problem-section');
  if (probSection) {
    gsap.utils.toArray('.aiq-problem-card').forEach((card, i) => {
      gsap.from(card, {
        scrollTrigger: { trigger: probSection, start: 'top 70%', toggleActions: 'play none none none' },
        y: 30, opacity: 0, duration: 0.4, delay: i * 0.1, immediateRender: false
      });
    });
  }

  // Framework accordion + visual
  var fwItems  = document.querySelectorAll('.aiq-fw-item');
  var fwVisuals = document.querySelectorAll('.aiq-fw-vis-panel');
  var fwCurrent = 0;

  function fwActivate(index) {
    // Deactivate all
    fwItems.forEach(function (item) { item.classList.remove('active'); });
    fwVisuals.forEach(function (vis) { vis.classList.remove('active'); });

    // Activate selected
    fwItems[index].classList.add('active');
    var phase = fwItems[index].getAttribute('data-phase');
    var vis = document.querySelector('[data-vis="' + phase + '"]');
    if (vis) vis.classList.add('active');

    fwCurrent = index;
  }

  // Click to switch
  fwItems.forEach(function (item, i) {
    item.addEventListener('click', function () {
      clearInterval(fwAutoTimer);
      fwActivate(i);
      fwAutoTimer = setInterval(fwAutoNext, 4000);
    });
  });

  // Auto-play: cycle every 4 seconds, only when section is in view
  function fwAutoNext() {
    fwActivate((fwCurrent + 1) % fwItems.length);
  }

  var fwAutoTimer = null;
  var fwHovered = false;

  function fwStartAuto() {
    if (fwHovered) return;
    clearInterval(fwAutoTimer);
    fwAutoTimer = setInterval(fwAutoNext, 4000);
  }

  function fwStopAuto() {
    clearInterval(fwAutoTimer);
    fwAutoTimer = null;
  }

  // Pause on hover
  var fwLayout = document.querySelector('.aiq-fw-layout');
  if (fwLayout) {
    fwLayout.addEventListener('mouseenter', function () { fwHovered = true; fwStopAuto(); });
    fwLayout.addEventListener('mouseleave', function () { fwHovered = false; fwStartAuto(); });

    // Only auto-play when section is visible in viewport
    var fwVisObserver = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        fwStartAuto();
      } else {
        fwStopAuto();
      }
    }, { threshold: 0 });
    fwVisObserver.observe(fwLayout);
  }

  // Scroll-triggered entrance
  gsap.from('.aiq-fw-layout', {
    scrollTrigger: { trigger: '.aiq-fw-layout', start: 'top 85%', toggleActions: 'play none none none' },
    y: 30, opacity: 0, duration: 0.4, immediateRender: false
  });

  // Five Pillars — staggered reveal on scroll
  var pillarsObserver = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      document.querySelectorAll('.aiq-pillar').forEach(function (p) {
        p.classList.add('visible');
      });
      pillarsObserver.disconnect();
    }
  }, { threshold: 0.15 });
  var pillarsEl = document.querySelector('.aiq-pillars');
  if (pillarsEl) pillarsObserver.observe(pillarsEl);

  // Scorecard — overall ring counter animation
  const scRing = document.querySelector('.aiq-sc-ring-value');
  if (scRing) {
    gsap.from('.aiq-sc-overall', {
      scrollTrigger: { trigger: '.aiq-sc-dashboard', start: 'top 80%', toggleActions: 'play none none none' },
      y: 20, opacity: 0, duration: 0.5, immediateRender: false
    });

    // Animate the ring stroke
    const ringCircle = document.querySelector('.aiq-sc-ring svg circle:nth-child(2)');
    if (ringCircle) {
      const finalOffset = ringCircle.getAttribute('stroke-dashoffset');
      ringCircle.setAttribute('stroke-dashoffset', '327');
      gsap.to(ringCircle, {
        scrollTrigger: { trigger: '.aiq-sc-dashboard', start: 'top 80%', toggleActions: 'play none none none' },
        attr: { 'stroke-dashoffset': finalOffset },
        duration: 1.2, ease: 'power2.out', delay: 0.3
      });
    }

    // Counter 0 → 73
    var counter = { val: 0 };
    gsap.to(counter, {
      scrollTrigger: { trigger: '.aiq-sc-dashboard', start: 'top 80%', toggleActions: 'play none none none' },
      val: 73, duration: 1.2, delay: 0.3, ease: 'power2.out',
      onUpdate: function () { scRing.innerHTML = Math.round(counter.val) + '<span>%</span>'; }
    });
  }

  // Scorecard — dimension rows, all triggered from dashboard
  var scDashboard = document.querySelector('.aiq-sc-dashboard');
  gsap.utils.toArray('.aiq-sc-dim').forEach(function (dim, i) {
    gsap.from(dim, {
      scrollTrigger: { trigger: scDashboard, start: 'top 75%', toggleActions: 'play none none none' },
      y: 20, opacity: 0, duration: 0.35, delay: 0.3 + i * 0.08, immediateRender: false
    });

    // Animate mini ring stroke
    var miniRing = dim.querySelector('svg circle:nth-child(2)');
    if (miniRing) {
      var finalDash = miniRing.getAttribute('stroke-dashoffset');
      miniRing.setAttribute('stroke-dashoffset', '113');
      gsap.to(miniRing, {
        scrollTrigger: { trigger: scDashboard, start: 'top 75%', toggleActions: 'play none none none' },
        attr: { 'stroke-dashoffset': finalDash },
        duration: 0.8, delay: 0.4 + i * 0.08, ease: 'power2.out'
      });
    }

    // Animate percentage number
    var pctEl = dim.querySelector('.aiq-sc-dim-pct');
    if (pctEl) {
      var target = parseInt(pctEl.textContent);
      pctEl.textContent = '0';
      var c = { v: 0 };
      gsap.to(c, {
        scrollTrigger: { trigger: scDashboard, start: 'top 75%', toggleActions: 'play none none none' },
        v: target, duration: 0.8, delay: 0.4 + i * 0.08, ease: 'power2.out',
        onUpdate: function () { pctEl.textContent = Math.round(c.v); }
      });
    }
  });

  // Consequence callout
  if (scDashboard) {
    gsap.from('.aiq-sc-consequence', {
      scrollTrigger: { trigger: scDashboard, start: 'top 75%', toggleActions: 'play none none none' },
      y: 10, opacity: 0, duration: 0.4, delay: 0.8, immediateRender: false
    });
  }

  // Smooth scroll for anchor links within this page
  document.querySelectorAll('a[href^="#aiq-"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        gsap.to(window, { duration: 1, scrollTo: target, ease: 'power3.inOut' });
      }
    });
  });

})();
