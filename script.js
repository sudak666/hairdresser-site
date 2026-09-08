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
