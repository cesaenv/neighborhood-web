/* ============================================================
   News grid — dynamic render from JSON
   Source of truth: assets/data/noticias.json
   ============================================================ */
(function () {
  'use strict';

  const GRID_ID = 'newsGrid';
  const DATA_URL = 'assets/data/noticias.json';
  const COLOR_VARS = {
    red: 'var(--red)',
    green: 'var(--green-dark)',
    amber: 'var(--amber)',
    blue: 'var(--blue)',
  };

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function buildCard(item, index) {
    const card = el('article', 'news-card' + (index === 0 ? ' news-card--featured' : ''));

    const img = el('div', 'news-card-img');
    img.style.background = COLOR_VARS[item.badgeColor] || 'var(--dark)';
    const badgeClass = item.badgeColor && item.badgeColor !== 'red' ? ` news-badge--${item.badgeColor}` : '';
    img.appendChild(el('span', 'news-badge' + badgeClass, item.badgeTexto || ''));
    card.appendChild(img);

    const body = el('div', 'news-body');
    body.appendChild(el('span', 'news-cat', item.categoriaLabel || ''));
    body.appendChild(el('h3', null, item.titulo || ''));
    body.appendChild(el('p', null, item.descripcion || ''));

    if (item.enlace && item.enlace.href) {
      const a = el('a', 'news-link', item.enlace.texto || 'Ver más →');
      a.href = item.enlace.href;
      body.appendChild(a);
    } else if (item.fechaTexto) {
      body.appendChild(el('span', 'news-date-text', item.fechaTexto));
    }
    card.appendChild(body);
    return card;
  }

  async function init() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    let items;
    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      items = await res.json();
    } catch (err) {
      console.error('Could not load noticias:', err);
      return;
    }
    if (!Array.isArray(items)) return;

    const sorted = items.slice().sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')));
    const frag = document.createDocumentFragment();
    sorted.forEach((item, i) => frag.appendChild(buildCard(item, i)));
    grid.innerHTML = '';
    grid.appendChild(frag);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
