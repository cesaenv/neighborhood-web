/* ============================================================
   Shared navbar loader — fetches assets/partials/navbar.html and
   injects it into #site-navbar-placeholder on every page, then
   renders the menu from NAV_ITEMS below, so the nav markup and
   the list of sections live in one place instead of being
   duplicated (and drifting) across every HTML file.
   ============================================================ */
(function () {
  'use strict';

  const PARTIAL_URL = 'assets/partials/navbar.html';

  const NAV_ITEMS = [
    { href: '#inicio', label: 'Inicio' },
    {
      href: '#noticias', label: 'Noticias',
      dropdown: [
        { href: '#noticias', label: 'Últimas noticias' },
        { divider: true },
        { href: 'historico-noticias.html', label: '📰 Histórico de noticias', highlight: true },
      ],
    },
    {
      href: '#fiestas', label: 'Fiestas',
      dropdown: [
        { href: '#fiestas', label: 'Programa de fiestas' },
        { divider: true },
        { href: 'historico-fiestas.html', label: '📅 Histórico de fiestas', highlight: true },
      ],
    },
    {
      href: '#actividades', label: 'Actividades',
      dropdown: [
        { href: '#actividades', label: 'Próximas actividades' },
        { divider: true },
        { href: 'historico-actividades.html', label: '📋 Histórico de actividades', highlight: true },
      ],
    },
    { href: '#patrimonio', label: 'Patrimonio' },
    { href: '#naturaleza', label: 'Naturaleza' },
    { href: '#galeria', label: 'Galería' },
    {
      href: '#contacto', label: 'Contacto',
      dropdown: [
        { href: '#contacto', label: 'Contacto' },
        { divider: true },
        { href: 'merchandising.html', label: '🛍️ Tienda', highlight: true },
      ],
    },
  ];

  function currentFile() {
    const file = window.location.pathname.split('/').pop();
    return file === '' ? 'index.html' : file;
  }

  function isHome() {
    return currentFile() === 'index.html';
  }

  function resolveHref(href) {
    if (!href.startsWith('#')) return href;
    return isHome() ? href : `index.html${href}`;
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function chevronSvg() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'nav-chevron');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.5');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M6 9l6 6 6-6');
    svg.appendChild(path);
    return svg;
  }

  function renderNavLinks() {
    const ul = document.getElementById('navLinks');
    if (!ul) return;
    ul.innerHTML = '';

    NAV_ITEMS.forEach(item => {
      const li = el('li');
      if (item.dropdown) li.className = 'nav-item-dropdown';

      const a = el('a', null, null);
      a.href = resolveHref(item.href);
      a.appendChild(document.createTextNode(item.label + ' '));
      if (item.dropdown) a.appendChild(chevronSvg());
      li.appendChild(a);

      if (item.dropdown) {
        const sub = el('ul', 'nav-dropdown');
        item.dropdown.forEach(sub_item => {
          const subLi = el('li');
          if (sub_item.divider) {
            subLi.appendChild(el('div', 'nav-dropdown-divider'));
          } else {
            const subA = el('a', sub_item.highlight ? 'dropdown-highlight' : null, sub_item.label);
            subA.href = resolveHref(sub_item.href);
            subLi.appendChild(subA);
          }
          sub.appendChild(subLi);
        });
        li.appendChild(sub);
      }

      ul.appendChild(li);
    });
  }

  function bindToggleAndDropdowns() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (!navbar || !navToggle || !navLinks) return;

    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      navToggle.classList.toggle('open');
      document.body.classList.toggle('nav-open', navLinks.classList.contains('open'));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        // Los enlaces que abren un submenú desplegable en móvil no deben cerrar el menú principal
        if (link.parentElement.classList.contains('nav-item-dropdown') && window.innerWidth <= 768) return;
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        document.body.classList.remove('nav-open');
      });
    });

    document.addEventListener('click', e => {
      if (!navbar.contains(e.target)) {
        navLinks.classList.remove('open');
        navToggle.classList.remove('open');
        document.body.classList.remove('nav-open');
        document.querySelectorAll('.nav-item-dropdown.open').forEach(d => d.classList.remove('open'));
      }
    });

    document.querySelectorAll('.nav-item-dropdown').forEach(item => {
      item.querySelector(':scope > a').addEventListener('click', e => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          const wasOpen = item.classList.contains('open');
          document.querySelectorAll('.nav-item-dropdown.open').forEach(d => d.classList.remove('open'));
          if (!wasOpen) item.classList.add('open');
        }
      });
    });
  }

  function bindScrolledState() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const hero = document.querySelector('.hero');
    if (!hero) {
      // Páginas sin hero transparente: la barra siempre muestra el fondo sólido.
      navbar.classList.add('scrolled');
      return;
    }
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    });
  }

  function bindActiveSectionHighlight() {
    const sections = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a');
    if (!sections.length || !navAnchors.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navAnchors.forEach(a => {
            a.style.background = a.getAttribute('href') === `#${id}`
              ? 'rgba(255,255,255,.15)'
              : '';
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  async function init() {
    const placeholder = document.getElementById('site-navbar-placeholder');
    if (!placeholder) return;
    try {
      const res = await fetch(PARTIAL_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      placeholder.outerHTML = await res.text();
      renderNavLinks();
      bindToggleAndDropdowns();
      bindScrolledState();
      bindActiveSectionHighlight();
    } catch (err) {
      console.error('Could not load navbar:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
