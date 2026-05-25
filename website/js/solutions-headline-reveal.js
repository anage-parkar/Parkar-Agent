/* =============================================
   PARKAR — Solutions Problem-Head Word Reveal
   Scroll-driven word-by-word colour reveal
   Inspired by globallogic.com/velocityai
   ============================================= */

(function () {
  'use strict';

  const SELECTOR = [
    '.problem-head h2',
    '.solutions-head h2',
    '.tech-stack-head h2',
    '.case-studies-head h2',
    '.partners-head h2',
    '.how-we-start-head h2'
  ].join(', ');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Split a single h2 into <i class="ph-word"> wrappers,
        preserving <br> and the teal <span> accent ─────────── */
  function splitHeadline(h2) {
    if (h2.dataset.phSplit === '1') return;
    h2.dataset.phSplit = '1';

    const out = document.createDocumentFragment();

    const splitText = (text, accent) => {
      const parts = text.split(/(\s+)/); // keep whitespace tokens
      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          out.appendChild(document.createTextNode(part));
          return;
        }
        const w = document.createElement('i');
        w.className = 'ph-word' + (accent ? ' ph-word-accent' : '');
        w.textContent = part;
        out.appendChild(w);
      });
    };

    Array.from(h2.childNodes).forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        splitText(node.textContent, false);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        if (tag === 'br') {
          out.appendChild(document.createElement('br'));
        } else if (tag === 'span') {
          // Recurse into span text — accent words
          const innerText = node.textContent || '';
          splitText(innerText, true);
        } else {
          // Unknown element — keep as-is
          out.appendChild(node.cloneNode(true));
        }
      }
    });

    h2.innerHTML = '';
    h2.appendChild(out);
  }

  /* ── Reveal driver ─────────────────────────────────────── */
  const headlines = []; // { h2, words, inView }

  function register(h2) {
    splitHeadline(h2);
    const words = h2.querySelectorAll('.ph-word');
    if (!words.length) return;
    if (reduced) {
      words.forEach((w) => w.classList.add('is-lit'));
      return;
    }
    headlines.push({ h2, words, inView: false, litCount: 0, done: false });
  }

  function update() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    headlines.forEach((entry) => {
      if (entry.done) return;
      if (!entry.inView) return;
      const rect = entry.h2.getBoundingClientRect();
      // Progress: 0 when top is at 85% of viewport, 1 when top is at 25%
      const start = vh * 0.85;
      const end = vh * 0.25;
      const raw = (start - rect.top) / (start - end);
      const progress = Math.max(0, Math.min(1, raw));
      const total = entry.words.length;
      const lit = Math.round(progress * total);
      // Monotonic: words can only progress forward, never un-light
      if (lit > entry.litCount) {
        for (let i = entry.litCount; i < lit; i++) {
          entry.words[i].classList.add('is-lit');
        }
        entry.litCount = lit;
      }
      if (entry.litCount >= total) {
        entry.done = true;
      }
    });
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }

  function init() {
    document.querySelectorAll(SELECTOR).forEach(register);
    if (!headlines.length) return;

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const entry = headlines.find((h) => h.h2 === e.target);
        if (!entry) return;
        entry.inView = e.isIntersecting;
      });
      update();
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });

    headlines.forEach((h) => io.observe(h.h2));

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('allComponentsLoaded', () => {
    // re-run in case components-injected layout shifted offsets
    update();
  });
})();
