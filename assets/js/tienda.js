/* ============================================================
   Tienda (merchandising) — dynamic render from JSON
   Source of truth: assets/data/tienda.json
   Products are inserted before the fixed "contact us" CTA card.
   ============================================================ */
(function () {
  'use strict';

  const GRID_ID = 'merchGrid';
  const DATA_URL = 'assets/data/tienda.json';
  const VALID_COLORS = ['red', 'green', 'blue', 'amber', 'purple'];

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function buildCard(product) {
    const color = VALID_COLORS.includes(product.color) ? product.color : 'red';
    const card = el('div', 'merch-card');

    const imgBox = el('div', 'merch-img');
    const placeholder = el('div', `merch-placeholder merch-placeholder--${color}`);
    if (product.imagen) {
      const img = el('img');
      img.src = product.imagen;
      img.alt = product.titulo || '';
      placeholder.appendChild(img);
    } else {
      placeholder.appendChild(el('span', 'merch-placeholder-icon', product.emoji || '🛍️'));
    }
    imgBox.appendChild(placeholder);
    card.appendChild(imgBox);

    const body = el('div', 'merch-body');
    body.appendChild(el('span', 'merch-cat', product.categoria || ''));
    body.appendChild(el('h3', null, product.titulo || ''));
    body.appendChild(el('p', null, product.descripcion || ''));

    const meta = el('div', 'merch-meta');
    meta.appendChild(el('span', 'merch-price', product.precio || 'Consultar precio'));
    if (product.badge) {
      const isLimited = /limitad/i.test(product.badge);
      meta.appendChild(el('span', 'merch-badge' + (isLimited ? ' merch-badge--limited' : ''), product.badge));
    }
    body.appendChild(meta);
    card.appendChild(body);
    return card;
  }

  async function init() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;
    const ctaCard = grid.querySelector('.merch-card--cta');

    let products;
    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      products = await res.json();
    } catch (err) {
      console.error('Could not load tienda:', err);
      return;
    }
    if (!Array.isArray(products)) return;

    grid.querySelectorAll('.merch-card:not(.merch-card--cta)').forEach(n => n.remove());
    const frag = document.createDocumentFragment();
    products.forEach(p => frag.appendChild(buildCard(p)));
    if (ctaCard) {
      grid.insertBefore(frag, ctaCard);
    } else {
      grid.appendChild(frag);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
