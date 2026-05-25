/* =============================================
   PARKAR.IN – Blog Page Scripts
   js/page-blog.js
   ============================================= */

(function () {
  'use strict';

  function init() {
    /* ── TOC active highlight on scroll ── */
    var tocLinks = document.querySelectorAll('.art-toc-list a');
    var headings = [];

    for (var i = 0; i < tocLinks.length; i++) {
      var href = tocLinks[i].getAttribute('href');
      if (href && href.charAt(0) === '#') {
        var el = document.getElementById(href.slice(1));
        if (el) headings.push({ link: tocLinks[i], el: el });
      }
    }

    if (headings.length) {
      function updateToc() {
        var scrollY = window.scrollY + 120;
        var current = null;
        for (var j = 0; j < headings.length; j++) {
          if (headings[j].el.offsetTop <= scrollY) {
            current = headings[j].link;
          }
        }
        for (var k = 0; k < tocLinks.length; k++) {
          tocLinks[k].classList.remove('active');
        }
        if (current) current.classList.add('active');
      }
      window.addEventListener('scroll', updateToc, { passive: true });
      updateToc();
    }

    /* ── Smooth scroll for TOC links ── */
    for (var m = 0; m < tocLinks.length; m++) {
      tocLinks[m].addEventListener('click', function (e) {
        var href = this.getAttribute('href');
        if (href && href.charAt(0) === '#') {
          e.preventDefault();
          var target = document.getElementById(href.slice(1));
          if (target) {
            window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
          }
        }
      });
    }

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
