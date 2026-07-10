/* ============================================================
   Aldeanueva de Cameros — Asociación de Vecinos
   ============================================================ */

// ── Navbar scroll ────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Mobile nav toggle ─────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  });
});

// Close nav clicking outside
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
    document.querySelectorAll('.nav-item-dropdown.open').forEach(d => d.classList.remove('open'));
  }
});

// ── Dropdowns ─────────────────────────────────────────────────
document.querySelectorAll('.nav-item-dropdown').forEach(item => {
  const trigger = item.querySelector(':scope > a');
  trigger.addEventListener('click', (e) => {
    // En móvil: toggle del dropdown
    if (window.innerWidth <= 768) {
      e.preventDefault();
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.nav-item-dropdown.open').forEach(d => d.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    }
  });
});

// ── Active nav link on scroll ─────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

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

// ── Lightbox galería ──────────────────────────────────────────
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightboxImg');
const lightboxCap   = document.getElementById('lightboxCaption');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('.galeria-real, .patrimonio-img, .nat-card-foto').forEach(item => {
  const img = item.querySelector('img');
  if (!img) return;
  item.style.cursor = 'pointer';
  item.addEventListener('click', () => {
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCap.textContent = item.querySelector('.galeria-caption')?.textContent || img.alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  });
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxImg.src = '';
  document.body.style.overflow = '';
}

// ── Galería filters ───────────────────────────────────────────
const filterBtns = document.querySelectorAll('.filter-btn');
const galeriaItems = document.querySelectorAll('.galeria-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    galeriaItems.forEach(item => {
      const show = filter === 'all' || item.dataset.cat === filter;
      item.classList.toggle('hidden', !show);
    });
  });
});

// ── Formulario de contacto ────────────────────────────────────
function handleForm(e) {
  e.preventDefault();
  const form    = e.target;
  const success = document.getElementById('formSuccess');

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
