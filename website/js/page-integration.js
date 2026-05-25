/* =============================================
   PARKAR.IN – Vector / Integration Page JS
   js/page-integration.js
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ───────── Elements ───────── */
  const cards       = document.querySelectorAll('.int-card');
  const filters     = document.querySelectorAll('.filter-item-name');
  const searchInput = document.getElementById('searchInput');

  /* ───────── Filter logic ───────── */
  let activeFilter = 'all';

  function applyFilters() {
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

    cards.forEach(card => {
      const cat  = card.dataset.category || '';
      const name = card.dataset.name     || '';
      const text = card.querySelector('.text-block-8');
      const desc = text ? text.textContent.toLowerCase() : '';
      const lbl  = card.querySelector('.card-label');
      const label = lbl ? lbl.textContent.toLowerCase() : '';

      const matchFilter = activeFilter === 'all' || cat === activeFilter;
      const matchSearch = !query
        || name.toLowerCase().includes(query)
        || desc.includes(query)
        || label.includes(query)
        || cat.toLowerCase().includes(query);

      if (matchFilter && matchSearch) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });

    // Re-trigger visible animation for unhidden cards
    revealVisibleCards();
  }

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      filters.forEach(f => f.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', applyFilters);
  }

  /* ───────── Card reveal on scroll (IntersectionObserver) ───────── */
  function revealVisibleCards() {
    const visCards = document.querySelectorAll('.int-card:not(.hidden)');
    visCards.forEach((card, i) => {
      card.classList.remove('visible');
      // Stagger the reveal
      setTimeout(() => {
        card.classList.add('visible');
      }, i * 60);
    });
  }

  // Also use IntersectionObserver for scroll-based reveal
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  cards.forEach(card => observer.observe(card));

  // Initial reveal for cards already in viewport
  setTimeout(revealVisibleCards, 200);

});
