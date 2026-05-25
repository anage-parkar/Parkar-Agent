/* =============================================
   PARKAR.IN - Article Table of Contents
   js/article-toc.js
   Auto-generates TOC from <h2> headings inside .art-body
   and highlights the active section on scroll.
   ============================================= */

(function () {
  'use strict';

  var tocList = document.getElementById('tocList');
  var artBody = document.querySelector('.art-body');
  if (!tocList || !artBody) return;

  var headings = artBody.querySelectorAll('h2');
  if (headings.length === 0) return;

  // Build TOC links
  headings.forEach(function (h2, i) {
    var id = 'section-' + i;
    h2.id = id;

    var li = document.createElement('li');
    var a = document.createElement('a');
    a.href = '#' + id;
    a.textContent = h2.textContent;
    li.appendChild(a);
    tocList.appendChild(li);
  });

  // Smooth scroll
  tocList.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      e.preventDefault();
      var target = document.querySelector(e.target.getAttribute('href'));
      if (target) {
        var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 72;
        window.scrollTo({ top: target.offsetTop - navH - 24, behavior: 'smooth' });
      }
    }
  });

  // Scroll-spy: highlight active link
  var tocLinks = tocList.querySelectorAll('a');
  var navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--navbar-height')) || 72;

  function updateActive() {
    var scrollPos = window.scrollY + navHeight + 60;
    var activeIndex = 0;
    headings.forEach(function (h2, i) {
      if (h2.offsetTop <= scrollPos) activeIndex = i;
    });
    tocLinks.forEach(function (link, i) {
      link.classList.toggle('active', i === activeIndex);
    });
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();
