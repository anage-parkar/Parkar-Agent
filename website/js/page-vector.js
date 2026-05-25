/* =============================================
   PARKAR.IN - Vector Overview Page Scripts
   js/page-vector.js
   ============================================= */

'use strict';

/* ─── Scroll Reveal ─── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-up, .fade-in').forEach((el, i) => {
  el.style.transitionDelay = (i % 5) * 0.07 + 's';
  revealObserver.observe(el);
});

/* ─── Tab Switcher (Three Domains) ─── */
function switchTab(btn, panelId) {
  // Deactivate all tabs
  document.querySelectorAll('.vec-tab-btn').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  // Deactivate all panels
  document.querySelectorAll('.vec-tab-panel').forEach(p => p.classList.remove('active'));

  // Activate clicked
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  const panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
}

/* ─── Before / After Toggle ─── */
function switchValue(btn, panelId) {
  // Deactivate all toggle buttons
  document.querySelectorAll('.vec-tog-btn').forEach(b => b.classList.remove('active'));
  // Deactivate all value panels
  document.querySelectorAll('.vec-value-panel').forEach(p => p.classList.remove('active'));

  // Activate
  btn.classList.add('active');
  const panel = document.getElementById('value-' + panelId);
  if (panel) panel.classList.add('active');
}

/* ─── Stats Counter Animation ─── */
function formatNumber(n) {
  if (n >= 1000) {
    return n.toLocaleString('en-US');
  }
  return n;
}

function animateCounters() {
  document.querySelectorAll('.vec-stat-number[data-target]').forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    const suffix = el.getAttribute('data-suffix') || '';
    let current = 0;
    const duration = 1800;
    const steps = 60;
    const increment = target / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(Math.round(increment * step), target);

      if (target >= 1000) {
        el.textContent = current.toLocaleString('en-US') + suffix;
      } else {
        el.textContent = current + suffix;
      }

      if (step >= steps) {
        clearInterval(timer);
        // Set final value
        if (target >= 1000) {
          el.textContent = target.toLocaleString('en-US') + suffix;
        } else {
          el.textContent = target + suffix;
        }
      }
    }, duration / steps);
  });
}

const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    animateCounters();
    statsObserver.disconnect();
  }
}, { threshold: 0.3 });

const statsSection = document.querySelector('.vec-stats');
if (statsSection) statsObserver.observe(statsSection);

/* ─── Auto-cycle tabs every 4s ─── */
let tabCycleActive = true;
let currentTabIndex = 0;
const tabButtons = document.querySelectorAll('.vec-tab-btn');
const tabIds = ['tab-infra', 'tab-apps', 'tab-security'];

function cycleTab() {
  if (!tabCycleActive || tabButtons.length === 0) return;
  currentTabIndex = (currentTabIndex + 1) % tabIds.length;
  switchTab(tabButtons[currentTabIndex], tabIds[currentTabIndex]);
}

let tabCycleTimer = setInterval(cycleTab, 4500);

// Pause auto-cycle when user interacts
document.querySelectorAll('.vec-tab-btn').forEach((btn, i) => {
  btn.addEventListener('click', () => {
    tabCycleActive = false;
    clearInterval(tabCycleTimer);
    currentTabIndex = i;
    // Resume after 10s of inactivity
    setTimeout(() => {
      tabCycleActive = true;
      tabCycleTimer = setInterval(cycleTab, 4500);
    }, 10000);
  });
});

/* ─── Keyboard nav for tabs ─── */
document.querySelectorAll('.vec-tab-btn').forEach((btn, i) => {
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      const next = tabButtons[(i + 1) % tabButtons.length];
      next.focus();
      next.click();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = tabButtons[(i - 1 + tabButtons.length) % tabButtons.length];
      prev.focus();
      prev.click();
    }
  });
});

