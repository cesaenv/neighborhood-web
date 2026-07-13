/* ============================================================
   Tienda (merchandising) — dynamic render from JSON
   Source of truth: assets/data/tienda.json
   ============================================================ */
(function () {
  'use strict';

  const GRID_ID = 'merchGrid';
  const DATA_URL = 'assets/data/tienda.json';
  const CONFIG_URL = 'assets/data/config.json';
  const VALID_COLORS = ['red', 'green', 'blue', 'amber', 'purple'];
  const DEFAULT_EMAIL = 'asociacion@aldeanuevadecameros.es';

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function openLightbox(src, alt) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCap = document.getElementById('lightboxCaption');
    if (!lightbox || !lightboxImg) return;

    lightboxImg.src = src;
    lightboxImg.alt = alt || '';
    if (lightboxCap) lightboxCap.textContent = alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function buildCard(product) {
    const color = VALID_COLORS.includes(product.color) ? product.color : 'red';
    const card = el('div', 'merch-card');
    if (product.categoria) card.dataset.categoria = product.categoria;

    const imgBox = el('div', 'merch-img');
    const placeholder = el('div', `merch-placeholder merch-placeholder--${color}`);
    if (product.imagen) {
      const img = el('img');
      img.src = product.imagen;
      img.alt = product.titulo || '';
      placeholder.appendChild(img);
      placeholder.appendChild(el('span', 'merch-zoom', '🔍'));
      placeholder.style.cursor = 'zoom-in';
      placeholder.addEventListener('click', () => openLightbox(img.src, img.alt));
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
    if (product.precio) {
      meta.appendChild(el('span', 'merch-price', product.precio));
    } else {
      const subject = encodeURIComponent(`Consulta de precio: ${product.titulo || ''}`);
      const mailBody = encodeURIComponent(`Hola,\n\nMe gustaría consultar el precio y disponibilidad de: ${product.titulo || ''}\n\n`);
      const link = el('a', 'merch-price merch-price--link', 'Consultar precio');
      link.href = `mailto:${DEFAULT_EMAIL}?subject=${subject}&body=${mailBody}`;
      meta.appendChild(link);
    }
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

    grid.querySelectorAll('.merch-card').forEach(n => n.remove());
    const frag = document.createDocumentFragment();
    products.forEach(p => frag.appendChild(buildCard(p)));
    grid.appendChild(frag);

    try {
      const res = await fetch(CONFIG_URL, { cache: 'no-cache' });
      if (res.ok) {
        const config = await res.json();
        if (config.contactoEmail) {
          grid.querySelectorAll(`a[href^="mailto:${DEFAULT_EMAIL}"]`).forEach(a => {
            const url = new URL(a.href);
            a.href = `mailto:${config.contactoEmail}${url.search}`;
          });
        }
      }
    } catch (err) {
      console.error('Could not load site config:', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
