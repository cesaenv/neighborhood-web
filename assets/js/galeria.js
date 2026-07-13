/* ============================================================
   Gallery grid — dynamic render from JSON
   ------------------------------------------------------------
   Source of truth: assets/data/galeria.json
   The Telegram bot only appends objects to that JSON; this page
   renders them. Owns the gallery filter and lightbox-open (the
   lightbox close logic lives in main.js and is shared).

   Note: JSON keys stay in Spanish (shared schema with the bot).
   ============================================================ */

(function () {
  'use strict';

  const GRID_ID = 'galeriaGrid';
  const DATA_URL = 'assets/data/galeria.json';

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* --- Single gallery item ------------------------------------ */
  function buildItem(photo) {
    const size = photo.size ? ` galeria-item--${photo.size}` : '';
    const item = el('div', 'galeria-item' + size);
    item.dataset.cat = photo.categoria || '';

    const real = el('div', 'galeria-real');
    const img = el('img');
    img.src = photo.img;
    img.alt = photo.alt || photo.caption || '';
    img.loading = 'lazy';
    if (photo.imgStyle) img.setAttribute('style', photo.imgStyle);
    real.appendChild(img);

    if (photo.caption) real.appendChild(el('div', 'galeria-caption', photo.caption));
    item.appendChild(real);
    item.dataset.destacada = photo.destacada ? '1' : '0';
    return item;
  }

  /* --- Category filter -----------------------------------------
     "Todos" solo muestra las fotos marcadas como destacadas en el
     JSON, para no saturar la vista general con el archivo completo.
     Cada categoría concreta sigue mostrando todas sus fotos. -------- */
  function applyFilter(filter) {
    document.querySelectorAll('#' + GRID_ID + ' .galeria-item').forEach(it => {
      const show = filter === 'all' ? it.dataset.destacada === '1' : it.dataset.cat === filter;
      it.classList.toggle('hidden', !show);
    });
  }

  function bindFilter() {
    const filterBtns = document.querySelectorAll('.galeria-filters .filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.dataset.filter);
      });
    });
  }

  /* --- Lightbox open (navigation + close handled by main.js) -- */
  function bindLightbox() {
    if (typeof openLightbox !== 'function') return;

    document.querySelectorAll('#' + GRID_ID + ' .galeria-real').forEach(realEl => {
      realEl.addEventListener('click', () => {
        // Navega solo entre las fotos visibles con el filtro actual.
        const visibleItems = Array.from(
          document.querySelectorAll('#' + GRID_ID + ' .galeria-item:not(.hidden) .galeria-real')
        );
        const images = visibleItems.map(el => {
          const img = el.querySelector('img');
          const caption = el.querySelector('.galeria-caption')?.textContent || img.alt || '';
          return { src: img.src, alt: img.alt, caption };
        });
        const idx = visibleItems.indexOf(realEl);
        const startIdx = idx === -1 ? 0 : idx;
        openLightbox(images, startIdx, images[startIdx].caption);
      });
    });
  }

  /* --- Bootstrap ---------------------------------------------- */
  async function init() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    let photos;
    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      photos = await res.json();
    } catch (err) {
      console.error('Could not load gallery:', err);
      return; // leave the grid empty on error
    }
    if (!Array.isArray(photos)) return;

    const frag = document.createDocumentFragment();
    photos.forEach(p => frag.appendChild(buildItem(p)));
    grid.innerHTML = '';
    grid.appendChild(frag);

    const activeBtn = document.querySelector('.galeria-filters .filter-btn.active');
    applyFilter(activeBtn ? activeBtn.dataset.filter : 'all');

    bindFilter();
    bindLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
