/* =============================================
   PARKAR.IN - GCC Blog Post Page JS
   js/page-gcc-blog.js
   ============================================= */

(function () {
  'use strict';

  /* ─── Scroll-reveal via IntersectionObserver ─── */
  function initReveal() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

    document.querySelectorAll('.fade-up, .fade-in').forEach((el) => {
      const siblings = Array.from(
        el.parentElement?.querySelectorAll(':scope > .fade-up, :scope > .fade-in') || []
      );
      const idx = siblings.indexOf(el);
      if (siblings.length > 1) {
        el.style.transitionDelay = `${idx * 0.09}s`;
      }
      observer.observe(el);
    });
  }

  /* ─── FAQ Accordion ─── */
  function initFaq() {
    document.querySelectorAll('.blog-faq-item').forEach(item => {
      const q = item.querySelector('.blog-faq-q');
      if (!q) return;

      q.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');

        // Close all
        document.querySelectorAll('.blog-faq-item.open').forEach(openItem => {
          openItem.classList.remove('open');
        });

        // Open clicked if it was closed
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });
  }

  /* ─── Share buttons ─── */
  function initShare() {
    document.querySelectorAll('.blog-share-btn[data-share]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = btn.getAttribute('data-share');
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        let shareUrl = '';

        switch (platform) {
          case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
            break;
          case 'whatsapp':
            shareUrl = `https://wa.me/?text=${title}%20${url}`;
            break;
          case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
            break;
          case 'telegram':
            shareUrl = `https://t.me/share/url?url=${url}&text=${title}`;
            break;
        }

        if (shareUrl) {
          window.open(shareUrl, '_blank', 'width=600,height=400,noopener');
        }
      });
    });
  }

  /* ─── Init ─── */
  document.addEventListener('DOMContentLoaded', () => {
    initReveal();
    initFaq();
    initShare();
  });

})();
