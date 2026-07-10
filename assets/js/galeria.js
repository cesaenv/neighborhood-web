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
    return item;
  }

  /* --- Category filter ---------------------------------------- */
  function bindFilter() {
    const filterBtns = document.querySelectorAll('.galeria-filters .filter-btn');
    const items = document.querySelectorAll('#' + GRID_ID + ' .galeria-item');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        items.forEach(it => {
          const show = filter === 'all' || it.dataset.cat === filter;
          it.classList.toggle('hidden', !show);
        });
      });
    });
  }

  /* --- Lightbox open (close handled by main.js) --------------- */
  function bindLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCap = document.getElementById('lightboxCaption');
    if (!lightbox || !lightboxImg) return;

    document.querySelectorAll('#' + GRID_ID + ' .galeria-real').forEach(realEl => {
      realEl.addEventListener('click', () => {
        const img = realEl.querySelector('img');
        if (!img) return;
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        if (lightboxCap) {
          lightboxCap.textContent =
            realEl.querySelector('.galeria-caption')?.textContent || img.alt || '';
        }
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
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

    bindFilter();
    bindLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
