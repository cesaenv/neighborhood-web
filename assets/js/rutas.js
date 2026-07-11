/* ============================================================
   Rutas recomendadas — dynamic render from JSON
   Source of truth: assets/data/rutas.json
   ============================================================ */
(function () {
  'use strict';

  const GRID_ID = 'rutasGrid';
  const DATA_URL = 'assets/data/rutas.json';

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function buildItem(ruta) {
    const item = el('div', 'ruta-item');

    const header = el('div', 'ruta-header');
    header.appendChild(el('span', `ruta-dif ruta-dif--${dificultadClass(ruta.dificultad)}`, ruta.dificultadLabel || ''));
    header.appendChild(el('span', 'ruta-time', '⏱ ' + (ruta.tiempo || '')));
    item.appendChild(header);

    item.appendChild(el('h4', null, ruta.titulo || ''));
    item.appendChild(el('p', null, ruta.descripcion || ''));

    const info = el('div', 'ruta-info');
    info.appendChild(el('span', null, '📏 ' + (ruta.distancia || '')));
    info.appendChild(el('span', null, '📈 ' + (ruta.desnivel || '')));
    item.appendChild(info);

    return item;
  }

  function dificultadClass(dificultad) {
    return { facil: 'easy', media: 'medium', dificil: 'hard' }[dificultad] || 'easy';
  }

  async function init() {
    const grid = document.getElementById(GRID_ID);
    if (!grid) return;

    let rutas;
    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      rutas = await res.json();
    } catch (err) {
      console.error('Could not load rutas:', err);
      return;
    }
    if (!Array.isArray(rutas)) return;

    const frag = document.createDocumentFragment();
    rutas.forEach(r => frag.appendChild(buildItem(r)));
    grid.innerHTML = '';
    grid.appendChild(frag);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
