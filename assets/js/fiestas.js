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
        const link = el('a', 'btn btn-outline', '📥 Descargar cartel');
        link.href = data.cartel;
        link.setAttribute('download', '');
        cartelBox.appendChild(link);
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
