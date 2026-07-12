/* ============================================================
   Aldeanueva de Cameros — Asociación de Vecinos
   ============================================================ */

// Nota: la barra de navegación (toggle móvil, dropdowns, estado
// "scrolled" y el resaltado de sección activa) se carga e inicializa
// desde assets/js/include-nav.js, una vez que assets/partials/navbar.html
// se inyecta en la página.

// ── Lightbox galería ──────────────────────────────────────────
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxCap   = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev  = document.getElementById('lightboxPrev');
const lightboxNext  = document.getElementById('lightboxNext');

let lightboxImages = [];
let lightboxIdx    = 0;

function openLightbox(images, startIdx, baseCaption) {
  lightboxImages = images;
  lightboxIdx = startIdx;
  lightboxCap.dataset.base = baseCaption || '';
  updateLightboxImage();
  const multi = lightboxImages.length > 1;
  lightboxPrev.classList.toggle('hidden', !multi);
  lightboxNext.classList.toggle('hidden', !multi);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function updateLightboxImage() {
  const current = lightboxImages[lightboxIdx];
  lightboxImg.src = current.src;
  lightboxImg.alt = current.alt;
  const base = lightboxImages.length > 1
    ? (current.caption || current.alt || lightboxCap.dataset.base || '')
    : (lightboxCap.dataset.base || current.alt || '');
  lightboxCap.textContent = lightboxImages.length > 1
    ? `${base} · ${lightboxIdx + 1} / ${lightboxImages.length}`
    : base;
}

function lightboxShowPrev() { lightboxIdx = (lightboxIdx - 1 + lightboxImages.length) % lightboxImages.length; updateLightboxImage(); }
function lightboxShowNext() { lightboxIdx = (lightboxIdx + 1) % lightboxImages.length; updateLightboxImage(); }

// Note: gallery items (.galeria-real) are rendered and bound by galeria.js.
document.querySelectorAll('.patrimonio-img:not(.patrimonio-carousel), .nat-card-foto:not(.patrimonio-carousel)').forEach(item => {
  const img = item.querySelector('img');
  if (!img) return;
  item.style.cursor = 'pointer';
  item.addEventListener('click', () => {
    const caption = item.querySelector('.galeria-caption')?.textContent || img.alt || '';
    openLightbox([{ src: img.src, alt: img.alt }], 0, caption);
  });
});

// ── Carruseles de Patrimonio (Iglesia / Ermita / Pozas) ────────
document.querySelectorAll('.patrimonio-carousel').forEach(carousel => {
  const slides = Array.from(carousel.querySelectorAll('.patrimonio-carousel-slide'));
  const dotsWrap = carousel.querySelector('.carousel-dots');
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  const images = slides.map(s => ({ src: s.src, alt: s.alt }));
  let idx = 0;
  let timer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Foto ${i + 1}`);
    dot.addEventListener('click', e => { e.stopPropagation(); goTo(i); resetTimer(); });
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.querySelectorAll('.carousel-dot'));

  function goTo(i) {
    idx = (i + slides.length) % slides.length;
    slides.forEach((s, si) => s.classList.toggle('active', si === idx));
    dots.forEach((d, di) => d.classList.toggle('active', di === idx));
  }
  function resetTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => goTo(idx + 1), 4500);
  }

  prevBtn.addEventListener('click', e => { e.stopPropagation(); goTo(idx - 1); resetTimer(); });
  nextBtn.addEventListener('click', e => { e.stopPropagation(); goTo(idx + 1); resetTimer(); });
  carousel.addEventListener('click', e => {
    if (e.target.closest('.carousel-arrow, .carousel-dot, .carousel-viewall')) return;
    openLightbox(images, idx, images[idx].alt);
  });

  resetTimer();
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', lightboxShowPrev);
lightboxNext.addEventListener('click', lightboxShowNext);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') lightboxShowPrev();
  if (e.key === 'ArrowRight') lightboxShowNext();
});

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxImg.src = '';
  document.body.style.overflow = '';
}

// Note: gallery filters are handled by galeria.js (items are dynamic).

// ── Formulario de contacto ────────────────────────────────────
// El email real vive en assets/data/config.json (contactoEmail);
// site-config.js reescribe #contactEmail cuando carga, y lo leemos
// de ahí para que el formulario use siempre la misma fuente.
function getContactEmail() {
  return document.getElementById('contactEmail')?.textContent.trim() || 'asociacion@aldeanuevadecameros.es';
}

function handleForm(e) {
  e.preventDefault();
  const form    = e.target;
  const success = document.getElementById('formSuccess');

  const nombre  = form.querySelector('#nombre').value.trim();
  const email   = form.querySelector('#email').value.trim();
  const asunto  = form.querySelector('#asunto').value.trim();
  const mensaje = form.querySelector('#mensaje').value.trim();

  const subject = asunto || 'Contacto desde la web';
  const body =
    `Nombre: ${nombre}\n` +
    `Email: ${email}\n\n` +
    `${mensaje}`;

  const mailtoUrl = `mailto:${getContactEmail()}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailtoUrl;

  form.style.opacity = '0';
  form.style.transition = 'opacity 0.3s ease';

  setTimeout(() => {
    form.style.display = 'none';
    success.classList.remove('hidden');
    success.style.animation = 'fadeInUp 0.5s ease forwards';
  }, 300);
}

// ── Animate on scroll ─────────────────────────────────────────
const animateObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = `${i * 0.08}s`;
      entry.target.classList.add('animate-in');
      animateObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.news-card, .fiesta-card, .nat-card, .ruta-item, .patrimonio-card, .doc-category, .galeria-item, .stat'
).forEach(el => {
  el.style.opacity = '0';
  animateObserver.observe(el);
});

// ── Smooth reveal for hero stats ──────────────────────────────
window.addEventListener('load', () => {
  document.querySelectorAll('.stat').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(12px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.1 + 0.5}s, transform 0.5s ease ${i * 0.1 + 0.5}s`;
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });
});

// ── Contadores animados en stats ──────────────────────────────
const statsEl = document.querySelector('.hero-stats');
let countersStarted = false;

const statsObserver = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting && !countersStarted) {
    countersStarted = true;
    document.querySelectorAll('.stat-num').forEach(el => {
      el.style.transition = 'transform 0.3s ease';
      el.style.transform = 'scale(1.15)';
      setTimeout(() => { el.style.transform = 'scale(1)'; }, 300);
    });
  }
}, { threshold: 0.5 });

if (statsEl) statsObserver.observe(statsEl);


// ── Año actual en footer ──────────────────────────────────────
document.querySelectorAll('.footer-bottom p').forEach(p => {
  p.innerHTML = p.innerHTML.replace('2026', new Date().getFullYear());
});
