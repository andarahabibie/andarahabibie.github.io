/* ===========================
   STORAGE (safe when blocked)
   =========================== */
function store(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch (e) { /* private mode or blocked: the page still works */ }
  return null;
}

/* ===========================
   REDACTION DEMO
   =========================== */
const DEMO = {
  en: {
    title: 'POWER OF ATTORNEY',
    parts: [
      'Applicant ', ['NAME', 'Budi Santoso'], ', ID number ', ['ID NUMBER', '3200000000000001'],
      ', living at ', ['ADDRESS', 'Jl. Contoh No. 1, East Jakarta'], '. Reach the applicant at ',
      ['EMAIL', 'budi.santoso@example.com'], ' or ', ['PHONE', '0812-0000-0000'], '.'
    ],
    btn: ['Redact', 'Show detected'],
    msg: [
      'The highlighted text is what AI-Redact finds. Press Redact to see the result.',
      'The real tool removes the text from the file itself, then checks that Ctrl+F finds nothing.'
    ],
    blocked: 'redacted'
  },
  id: {
    title: 'SURAT KUASA',
    parts: [
      'Pemohon atas nama ', ['NAMA', 'Budi Santoso'], ', NIK ', ['NIK', '3200000000000001'],
      ', beralamat di ', ['ALAMAT', 'Jl. Contoh No. 1, Jakarta Timur'], '. Pemohon dapat dihubungi melalui ',
      ['EMAIL', 'budi.santoso@example.com'], ' atau ', ['TELEPON', '0812-0000-0000'], '.'
    ],
    btn: ['Redaksi', 'Tampilkan temuan'],
    msg: [
      'Teks yang disorot adalah temuan AI-Redact. Tekan Redaksi untuk melihat hasilnya.',
      'Alat aslinya menghapus teks dari berkas itu sendiri, lalu memeriksa bahwa Ctrl+F tidak menemukan apa pun.'
    ],
    blocked: 'disamarkan'
  }
};

const redactBtn = document.getElementById('redact-btn');
const demoTitle = document.getElementById('demo-title');
const demoBody = document.getElementById('demo-body');
const demoMsg = document.getElementById('demo-msg');
let redacted = false;

function renderDemo(lang) {
  const d = DEMO[lang] || DEMO.en;
  const state = redacted ? 1 : 0;
  demoTitle.textContent = d.title;
  demoBody.textContent = '';
  d.parts.forEach(part => {
    if (typeof part === 'string') {
      demoBody.appendChild(document.createTextNode(part));
      return;
    }
    const span = document.createElement('span');
    span.className = redacted ? 'pii done' : 'pii';
    if (redacted) {
      span.textContent = '█'.repeat(part[1].length);
      span.setAttribute('aria-label', d.blocked);
    } else {
      span.appendChild(document.createTextNode(part[1]));
      const tag = document.createElement('sup');
      tag.textContent = part[0];
      span.appendChild(tag);
    }
    demoBody.appendChild(span);
  });
  redactBtn.textContent = d.btn[state];
  redactBtn.setAttribute('aria-pressed', String(redacted));
  demoMsg.textContent = d.msg[state];
}

redactBtn.addEventListener('click', () => {
  redacted = !redacted;
  renderDemo(currentLang);
});

/* ===========================
   LANGUAGE TOGGLE
   =========================== */
const html = document.documentElement;
const langBtn = document.getElementById('lang-toggle');
let currentLang = store('lang') === 'id' ? 'id' : 'en';

function applyLang(lang) {
  currentLang = lang;
  html.setAttribute('data-lang', lang);
  html.setAttribute('lang', lang);
  langBtn.textContent = lang === 'en' ? 'EN / ID' : 'ID / EN';
  langBtn.setAttribute('aria-label', lang === 'en' ? 'Ganti ke Bahasa Indonesia' : 'Switch to English');
  store('lang', lang);

  document.querySelectorAll('[data-en][data-id]').forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });
  renderDemo(lang);
}

langBtn.addEventListener('click', () => {
  applyLang(currentLang === 'en' ? 'id' : 'en');
});

applyLang(currentLang);

/* ===========================
   NAV SCROLL EFFECT
   =========================== */
const nav = document.getElementById('nav');

function onScroll() {
  nav.classList.toggle('scrolled', window.scrollY > 10);
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

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
}, { rootMargin: '-60px 0px -60% 0px', threshold: 0 });

sections.forEach(s => observer.observe(s));

/* ===========================
   MOBILE MENU
   =========================== */
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');

function setMenu(open) {
  mobileMenu.classList.toggle('open', open);
  menuToggle.classList.toggle('open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
}

menuToggle.addEventListener('click', () => setMenu(!mobileMenu.classList.contains('open')));
mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
window.addEventListener('resize', () => { if (window.innerWidth > 760) setMenu(false); });

/* ===========================
   SMOOTH SCROLL OFFSET
   (accounts for the fixed nav)
   =========================== */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const id = this.getAttribute('href');
    const target = id.length > 1 ? document.querySelector(id) : null;
    if (!target) return;
    e.preventDefault();
    const offset = nav.offsetHeight + 8;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: id === '#hero' ? 0 : top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    if (history.replaceState) history.replaceState(null, '', id);
  });
});

/* ===========================
   COPY EMAIL
   =========================== */
const copyBtn = document.getElementById('copy-mail');
const mailLink = document.getElementById('mail');
const COPIED = { en: 'Copied', id: 'Tersalin' };
const SELECTED = { en: 'Selected, press Ctrl+C', id: 'Terpilih, tekan Ctrl+C' };

function flash(text) {
  copyBtn.textContent = text;
  setTimeout(() => { copyBtn.textContent = copyBtn.getAttribute(`data-${currentLang}`); }, 2000);
}

copyBtn.addEventListener('click', () => {
  const text = mailLink.textContent.trim();
  const fallback = () => {
    const range = document.createRange();
    range.selectNodeContents(mailLink);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    flash(SELECTED[currentLang]);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => flash(COPIED[currentLang]), fallback);
  } else {
    fallback();
  }
});
