/* ============================================================
   Shared footer loader — fetches assets/partials/footer.html and
   injects it into #site-footer-placeholder on every page, so the
   footer markup lives in one place instead of being duplicated.
   ============================================================ */
(function () {
  'use strict';

  const PARTIAL_URL = 'assets/partials/footer.html';

  const SECCIONES = [
    { href: 'index.html', label: 'Inicio' },
    { href: 'index.html#noticias', label: 'Noticias' },
    { href: 'index.html#fiestas', label: 'Fiestas' },
    { href: 'index.html#actividades', label: 'Actividades' },
    { href: 'index.html#patrimonio', label: 'Patrimonio' },
    { href: 'index.html#naturaleza', label: 'Naturaleza' },
    { href: 'index.html#galeria', label: 'Galería' },
    { href: 'merchandising.html', label: 'Tienda' },
    { href: 'index.html#contacto', label: 'Contacto' },
  ];

  const DEFAULT_STATS = {
    title: 'El pueblo en cifras',
    items: [
      ['Municipio', 'Villanueva de Cameros'],
      ['Comarca', 'Sierra de Cameros'],
      ['Altitud', '1.140 m s.n.m.'],
      ['Río', 'Iregua'],
      ['Provincia', 'La Rioja'],
      ['Fiestas', '25-26 de Julio'],
    ],
  };

  const PAGE_STATS = {
    'historico-fiestas.html': {
      title: 'Fiestas de Aldeanueva',
      items: [
        ['2026', 'Santiago y Santa Ana'],
        ['2025', 'Santiago, Sta. Ana y Pantaleón'],
      ],
    },
  };

  function currentFile() {
    const file = window.location.pathname.split('/').pop();
    return file === '' ? 'index.html' : file;
  }

  function isHome() {
    return currentFile() === 'index.html';
  }

  function renderStats() {
    const title = document.getElementById('footerDataTitle');
    const list = document.getElementById('footerDataStats');
    if (!title || !list) return;
    const stats = PAGE_STATS[currentFile()] || DEFAULT_STATS;
    title.textContent = stats.title;
    list.innerHTML = '';
    stats.items.forEach(([label, value]) => {
      const li = document.createElement('li');
      const span = document.createElement('span');
      span.textContent = label;
      const strong = document.createElement('strong');
      strong.textContent = value;
      li.appendChild(span);
      li.appendChild(strong);
      list.appendChild(li);
    });
  }

  function renderSecciones() {
    const ul = document.getElementById('footerSecciones');
    if (!ul) return;
    const home = isHome();
    ul.innerHTML = '';
    SECCIONES.forEach(({ href, label }) => {
      const finalHref = home
        ? (href === 'index.html' ? '#inicio' : href.replace(/^index\.html#/, '#'))
        : href;
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = finalHref;
      a.textContent = label;
      li.appendChild(a);
      ul.appendChild(li);
    });
  }

  async function init() {
    const placeholder = document.getElementById('site-footer-placeholder');
    if (!placeholder) return;
    try {
      const res = await fetch(PARTIAL_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      placeholder.outerHTML = await res.text();
      renderSecciones();
      renderStats();
    } catch (err) {
      console.error('Could not load footer:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
