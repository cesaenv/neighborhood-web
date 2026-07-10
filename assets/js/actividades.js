/* ============================================================
   Activities timeline — dynamic render from JSON
   ------------------------------------------------------------
   Source of truth: assets/data/actividades.json
   The Telegram bot only appends objects to that JSON; this page
   renders them. No hand-written HTML per activity.

   Note: JSON keys stay in Spanish because they are the shared
   data schema produced by the bot and shown on the site.
   ============================================================ */

(function () {
  'use strict';

  const TIMELINE_ID = 'actTimeline';
  const DATA_URL = 'assets/data/actividades.json';

  /* --- Node creation helper ----------------------------------- */
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* --- Photo block (real image or placeholder) ---------------- */
  function buildPhoto(act) {
    const photo = el('div', 'act-foto');
    // Data for the lightbox
    photo.dataset.title = act.tituloLargo || act.titulo || '';
    photo.dataset.desc = [act.periodo, act.categoriaLabel].filter(Boolean).join(' · ');

    if (act.imagen) {
      const img = el('img');
      img.src = act.imagen;
      img.alt = act.imagenAlt || act.titulo || '';
      img.loading = 'lazy';
      if (act.imgStyle) img.setAttribute('style', act.imgStyle);
      photo.appendChild(img);
    } else {
      const ph = el('div', 'act-foto-placeholder');
      ph.appendChild(el('span', 'act-foto-placeholder-icon', act.emoji || '📷'));
      ph.appendChild(el('span', act.fotoPlaceholder || 'Foto de la actividad'));
      photo.appendChild(ph);
    }
    photo.appendChild(el('span', 'act-foto-zoom', '🔍'));
    return photo;
  }

  /* --- Card body ---------------------------------------------- */
  function buildBody(act) {
    const body = el('div', 'act-body');
    body.appendChild(
      el('div', 'act-cat', [act.categoriaLabel, act.periodo].filter(Boolean).join(' · '))
    );
    body.appendChild(el('h3', null, act.titulo || ''));
    body.appendChild(el('p', null, act.descripcion || ''));

    if (Array.isArray(act.tags) && act.tags.length) {
      const tags = el('div', 'act-tags');
      act.tags.forEach(t => tags.appendChild(el('span', 'act-tag', t)));
      body.appendChild(tags);
    }
    return body;
  }

  /* --- Central timeline node ---------------------------------- */
  function buildNode(act) {
    const node = el('div', 'act-node');
    node.appendChild(el('div', 'act-dot', act.emoji || '•'));
    node.appendChild(el('span', 'act-year-label', act.anio || ''));
    return node;
  }

  /* --- Full item (alternates left/right by index) ------------- */
  function buildItem(act, index) {
    const item = el('div', 'act-item');
    item.dataset.cat = act.categoria || '';

    const side = index % 2 === 0 ? 'right' : 'left';
    const card = el('div', 'act-card act-card-' + side);
    card.appendChild(buildPhoto(act));
    card.appendChild(buildBody(act));

    if (side === 'right') {
      // columns: node(2) · card(3) · spacer(1)
      item.appendChild(buildNode(act));
      item.appendChild(card);
      item.appendChild(el('div', 'act-spacer-left'));
    } else {
      // columns: card(1) · node(2) · spacer(3)
      item.appendChild(card);
      item.appendChild(buildNode(act));
      item.appendChild(el('div', 'act-spacer-right'));
    }
    return item;
  }

  /* --- Category filter ---------------------------------------- */
  function bindFilter() {
    const catBtns = document.querySelectorAll('.cat-btn');
    const items = document.querySelectorAll('.act-item');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        items.forEach(it => {
          it.style.display = (cat === 'todas' || it.dataset.cat === cat) ? '' : 'none';
        });
      });
    });
  }

  /* --- Lightbox ----------------------------------------------- */
  function bindLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxTit = document.getElementById('lightboxTitle');
    const lightboxDesc = document.getElementById('lightboxDesc');
    const lightboxClose = document.getElementById('lightboxClose');
    if (!lightbox) return;

    function closeLightbox() {
      lightbox.classList.remove('open');
      lightboxImg.src = '';
      document.body.style.overflow = '';
    }

    document.querySelectorAll('.act-foto').forEach(photoEl => {
      photoEl.addEventListener('click', () => {
        const img = photoEl.querySelector('img');
        if (!img) return; // placeholder without image: do not open
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxTit.textContent = photoEl.dataset.title || '';
        lightboxDesc.textContent = photoEl.dataset.desc || '';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
  }

  /* --- Empty / error state ------------------------------------ */
  function renderMessage(timeline, text) {
    timeline.innerHTML = '';
    const msg = el('p', null, text);
    msg.style.cssText = 'text-align:center;color:var(--text-muted);padding:40px 0;';
    timeline.appendChild(msg);
  }

  /* --- Bootstrap ---------------------------------------------- */
  async function init() {
    const timeline = document.getElementById(TIMELINE_ID);
    if (!timeline) return;

    let activities;
    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      activities = await res.json();
    } catch (err) {
      console.error('Could not load activities:', err);
      renderMessage(timeline, 'No se han podido cargar las actividades en este momento.');
      return;
    }

    if (!Array.isArray(activities) || activities.length === 0) {
      renderMessage(timeline, 'Todavía no hay actividades publicadas.');
      return;
    }

    // Only web-published activities, newest first.
    const visible = activities
      .filter(a => !a.publicacion || !a.publicacion.web || a.publicacion.web.estado === 'publicado')
      .sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')));

    const frag = document.createDocumentFragment();
    visible.forEach((act, i) => frag.appendChild(buildItem(act, i)));
    timeline.innerHTML = '';
    timeline.appendChild(frag);

    bindFilter();
    bindLightbox();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
