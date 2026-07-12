/* ============================================================
   Programa de fiestas — dynamic render from JSON
   Source of truth: assets/data/fiestas.json
   ============================================================ */
(function () {
  'use strict';

  const DATA_URL = 'assets/data/fiestas.json';

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* --- Lightbox open (close handled by main.js) --------------- */
  function openLightbox(src, alt, caption) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCap = document.getElementById('lightboxCaption');
    if (!lightbox || !lightboxImg) return;

    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    if (lightboxCap) lightboxCap.textContent = caption || alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function buildProgramItem(dia) {
    const item = el('div', 'program-item');
    item.appendChild(el('span', 'program-time', dia.dia || ''));
    const events = el('div', 'program-events');
    (dia.eventos || []).forEach(ev => events.appendChild(el('span', null, ev)));
    item.appendChild(events);
    return item;
  }

  async function init() {
    const titleEl = document.getElementById('fiestaTitulo');
    const fechasEl = document.getElementById('fiestaFechas');
    const descEl = document.getElementById('fiestaDesc');
    const programaEl = document.getElementById('fiestaPrograma');
    const cartelBox = document.getElementById('fiestaCartelBox');
    const programaPanel = document.getElementById('fiestaProgramaPanel');
    const tabBtns = document.querySelectorAll('.fiesta-tab-btn');
    if (!programaEl) return; // page has no fiestas section

    let data;
    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      data = await res.json();
    } catch (err) {
      console.error('Could not load fiestas program:', err);
      return;
    }
    if (!data) return;

    if (titleEl) titleEl.textContent = data.titulo || '';
    if (fechasEl) fechasEl.textContent = data.fechas || '';
    if (descEl) descEl.textContent = data.descripcion || '';

    programaEl.innerHTML = '';
    (data.programa || []).forEach(dia => programaEl.appendChild(buildProgramItem(dia)));

    if (cartelBox) {
      cartelBox.innerHTML = '';
      if (data.cartel) {
        const preview = el('img', 'fiesta-cartel-img');
        preview.src = data.cartel;
        preview.alt = 'Cartel de ' + (data.titulo || 'fiestas');
        preview.loading = 'lazy';
        preview.style.cursor = 'zoom-in';
        preview.addEventListener('click', () => openLightbox(preview.src, preview.alt, data.titulo || ''));
        cartelBox.appendChild(preview);

        const link = el('a', 'btn btn-outline', '📥 Descargar cartel');
        link.href = data.cartel;
        link.setAttribute('download', '');
        cartelBox.appendChild(link);
      }
    }

    if (tabBtns.length && programaPanel && cartelBox) {
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const showCartel = btn.dataset.tab === 'cartel';
          programaPanel.classList.toggle('fiesta-panel-hidden', showCartel);
          cartelBox.classList.toggle('fiesta-panel-hidden', !showCartel);
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
