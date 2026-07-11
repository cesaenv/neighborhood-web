/* ============================================================
   Site-wide config — contact email + junta directiva
   Source of truth: assets/data/config.json
   Included on every page: rewrites mailto links to the
   configured association email (preserving each link's
   ?subject=...), and fills #contactEmail / #juntaGrid when
   present on the page.
   ============================================================ */
(function () {
  'use strict';

  const DATA_URL = 'assets/data/config.json';
  const DEFAULT_EMAIL = 'asociacion@aldeanuevadecameros.es';

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function rewriteMailtoLinks(email) {
    document.querySelectorAll(`a[href^="mailto:${DEFAULT_EMAIL}"]`).forEach(a => {
      const url = new URL(a.href);
      a.href = `mailto:${email}${url.search}`;
    });
  }

  function renderContactEmail(email) {
    const span = document.getElementById('contactEmail');
    if (span) span.textContent = email;
  }

  function renderJunta(junta) {
    const grid = document.getElementById('juntaGrid');
    if (!grid || !junta) return;
    const roles = [
      ['Presidente/a', junta.presidente],
      ['Secretario/a', junta.secretario],
      ['Tesorero/a', junta.tesorero],
      ['Vocales', junta.vocales],
    ];
    grid.innerHTML = '';
    roles.forEach(([label, name]) => {
      const item = el('div', 'junta-item');
      item.appendChild(el('span', 'junta-role', label));
      item.appendChild(el('span', 'junta-name', name || 'Por designar'));
      grid.appendChild(item);
    });
  }

  async function init() {
    let data;
    try {
      const res = await fetch(DATA_URL, { cache: 'no-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      data = await res.json();
    } catch (err) {
      console.error('Could not load site config:', err);
      return; // keep the hardcoded fallback email/junta already in the HTML
    }

    if (data.contactoEmail) {
      rewriteMailtoLinks(data.contactoEmail);
      renderContactEmail(data.contactoEmail);
    }
    renderJunta(data.junta);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
