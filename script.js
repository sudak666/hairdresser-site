// ==== НАЛАШТУВАННЯ ЗАПИСУ (заповни своїми даними) ====
const TELEGRAM_USERNAME = 'your_telegram_username'; // без @, напр. 'olga_hair'
const VIBER_PHONE = '380000000000'; // номер у форматі 380XXXXXXXXX, без +

document.getElementById('year').textContent = new Date().getFullYear();

// Бургер-меню
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// Форма запису -> повідомлення в Telegram
function buildMessage(data) {
  return [
    'Запис на прийом:',
    `Ім'я: ${data.name}`,
    `Телефон: ${data.phone}`,
    `Майстер: ${data.master}`,
    `Послуга: ${data.service}`,
    `Дата: ${data.date}`,
    data.comment ? `Коментар: ${data.comment}` : null,
  ].filter(Boolean).join('\n');
}

const form = document.getElementById('booking-form');
const viberFallback = document.getElementById('viber-fallback');

function getFormData() {
  const fd = new FormData(form);
  return {
    name: fd.get('name')?.toString().trim() || '',
    phone: fd.get('phone')?.toString().trim() || '',
    master: fd.get('master')?.toString().trim() || '',
    service: fd.get('service')?.toString().trim() || '',
    date: fd.get('date')?.toString().trim() || '',
    comment: fd.get('comment')?.toString().trim() || '',
  };
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const message = buildMessage(getFormData());
  const url = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener');
});

viberFallback.addEventListener('click', (e) => {
  e.preventDefault();
  if (!form.reportValidity()) return;
  const message = buildMessage(getFormData());
  const url = `viber://chat?number=%2B${VIBER_PHONE}&text=${encodeURIComponent(message)}`;
  window.location.href = url;
});

// Scroll-reveal для карток/секцій
const revealTargets = document.querySelectorAll(
  '.service-group, .gallery-item, .team-card, .review-card'
);
revealTargets.forEach(el => el.classList.add('reveal'));

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach(el => revealObserver.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('in-view'));
}

// Активний пункт навігації при скролі
const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));
const navSections = navLinks
  .map(a => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

if ('IntersectionObserver' in window && navSections.length) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = `#${entry.target.id}`;
      navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  navSections.forEach(sec => navObserver.observe(sec));
}

// Ховаємо плаваючу кнопку запису, коли форма вже видно
const mobileCta = document.querySelector('.mobile-cta');
const bookingSection = document.getElementById('booking');
if (mobileCta && bookingSection && 'IntersectionObserver' in window) {
  const ctaObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      mobileCta.style.display = entry.isIntersecting ? 'none' : '';
    });
  }, { threshold: 0.2 });
  ctaObserver.observe(bookingSection);
}
