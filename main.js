/* ===========================
   LANGUAGE TOGGLE
   =========================== */
const html = document.documentElement;
const langBtn = document.getElementById('lang-toggle');
let currentLang = localStorage.getItem('lang') || 'en';

function applyLang(lang) {
  currentLang = lang;
  html.setAttribute('data-lang', lang);
  html.setAttribute('lang', lang === 'id' ? 'id' : 'en');
  langBtn.textContent = lang === 'en' ? 'EN / ID' : 'ID / EN';
  localStorage.setItem('lang', lang);

  document.querySelectorAll('[data-en][data-id]').forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });
}

langBtn.addEventListener('click', () => {
  applyLang(currentLang === 'en' ? 'id' : 'en');
});

// Apply on load
applyLang(currentLang);

/* ===========================
   NAV SCROLL EFFECT
   =========================== */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}, { passive: true });

/* ===========================
   ACTIVE NAV LINK
   =========================== */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { rootMargin: `-${60}px 0px -60% 0px`, threshold: 0 });

sections.forEach(s => observer.observe(s));

/* ===========================
   MOBILE MENU
   =========================== */
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

menuToggle.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuToggle.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', open);
});

// Close on link click
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    menuToggle.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ===========================
   SMOOTH SCROLL OFFSET
   (accounts for fixed nav)
   =========================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = document.getElementById('nav').offsetHeight + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});
