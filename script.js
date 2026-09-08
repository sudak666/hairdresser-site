// ==== НАЛАШТУВАННЯ ЗАПИСУ (заповни своїми даними) ====
const TELEGRAM_USERNAME = 'your_telegram_username'; // без @, напр. 'olga_hair'
const VIBER_PHONE = '380000000000'; // номер у форматі 380XXXXXXXXX, без +

document.getElementById('year').textContent = new Date().getFullYear();

// Індикатор "зараз відкрито/закрито" — Пн-Сб, 09:00-19:00 (звір з реальним графіком у розмітці нижче)
const OPEN_DAYS = [1, 2, 3, 4, 5, 6]; // Пн(1)..Сб(6), 0 = Нд
const OPEN_HOUR = 9;
const CLOSE_HOUR = 19;
const openStatusEl = document.getElementById('open-status');
if (openStatusEl) {
  const now = new Date();
  const isOpenNow = OPEN_DAYS.includes(now.getDay()) && now.getHours() >= OPEN_HOUR && now.getHours() < CLOSE_HOUR;
  openStatusEl.hidden = false;
  openStatusEl.classList.add(isOpenNow ? 'is-open' : 'is-closed');
  openStatusEl.textContent = isOpenNow ? 'Зараз відкрито' : 'Зараз зачинено';
}

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

// Кастомні select/date поля не беруть участь у нативному required-UI
// (елемент візуально прихований), тож валідуємо їх окремо перед сабмітом.
function validateCustomFields() {
  let firstInvalidTrigger = null;
  document.querySelectorAll('.custom-select, .custom-date').forEach(wrap => {
    const native = wrap.querySelector('.cs-native, .cd-native');
    const trigger = wrap.querySelector('.cs-trigger');
    const isEmpty = !native.value;
    wrap.classList.toggle('field-invalid', isEmpty);
    if (isEmpty && !firstInvalidTrigger) firstInvalidTrigger = trigger;
  });
  return firstInvalidTrigger;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const firstInvalid = validateCustomFields();
  if (firstInvalid) {
    firstInvalid.focus();
    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (!form.reportValidity()) return;
  const message = buildMessage(getFormData());
  const url = `https://t.me/${TELEGRAM_USERNAME}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener');
});

viberFallback.addEventListener('click', (e) => {
  e.preventDefault();
  const firstInvalid = validateCustomFields();
  if (firstInvalid) {
    firstInvalid.focus();
    firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  if (!form.reportValidity()) return;
  const message = buildMessage(getFormData());
  const url = `viber://chat?number=%2B${VIBER_PHONE}&text=${encodeURIComponent(message)}`;
  window.location.href = url;
});

// ==== Фірмовий select (заміна системного випадного списку) ====
function closeAllCustomPanels(except) {
  document.querySelectorAll('.custom-select, .custom-date').forEach(wrap => {
    if (wrap === except) return;
    const trigger = wrap.querySelector('.cs-trigger');
    const panel = wrap.querySelector('.cs-panel, .cd-panel');
    if (panel) panel.hidden = true;
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  });
}

function enhanceCustomSelect(wrap) {
  const native = wrap.querySelector('.cs-native');
  const trigger = wrap.querySelector('.cs-trigger');
  const valueEl = trigger.querySelector('.cs-value');
  const panel = wrap.querySelector('.cs-panel');

  Array.from(native.options).forEach(opt => {
    if (!opt.value) return;
    const li = document.createElement('li');
    li.setAttribute('role', 'option');
    li.dataset.value = opt.value;
    li.textContent = opt.textContent;
    panel.appendChild(li);
  });
  const items = Array.from(panel.querySelectorAll('li'));

  function selectValue(value, label) {
    native.value = value;
    valueEl.textContent = label;
    trigger.classList.add('has-value');
    items.forEach(li => li.classList.toggle('cs-selected', li.dataset.value === value));
    wrap.classList.remove('field-invalid');
    native.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function open() {
    closeAllCustomPanels(wrap);
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
  }
  function close() {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    items.forEach(li => li.classList.remove('cs-active'));
  }

  trigger.addEventListener('click', () => (panel.hidden ? open() : close()));

  panel.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    selectValue(li.dataset.value, li.textContent);
    close();
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (panel.hidden) { open(); return; }
      let idx = items.findIndex(li => li.classList.contains('cs-active'));
      idx = e.key === 'ArrowDown' ? Math.min(idx + 1, items.length - 1) : Math.max(idx - 1, 0);
      items.forEach(li => li.classList.remove('cs-active'));
      if (items[idx]) { items[idx].classList.add('cs-active'); items[idx].scrollIntoView({ block: 'nearest' }); }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (panel.hidden) { open(); return; }
      const active = items.find(li => li.classList.contains('cs-active')) || items[0];
      if (active) { selectValue(active.dataset.value, active.textContent); close(); }
    } else if (e.key === 'Escape') {
      close();
    }
  });
}

document.querySelectorAll('.custom-select').forEach(enhanceCustomSelect);

// ==== Фірмовий календар (заміна системного датапікера) ====
function enhanceCustomDate(wrap) {
  const native = wrap.querySelector('.cd-native');
  const trigger = wrap.querySelector('.cs-trigger');
  const valueEl = trigger.querySelector('.cs-value');
  const panel = wrap.querySelector('.cd-panel');
  const monthLabel = panel.querySelector('.cd-month-label');
  const grid = panel.querySelector('.cd-grid');
  const prevBtn = panel.querySelector('.cd-nav[data-dir="-1"]');
  const nextBtn = panel.querySelector('.cd-nav[data-dir="1"]');

  const MONTHS_GEN = ['січня', 'лютого', 'березня', 'квітня', 'травня', 'червня', 'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня'];
  const MONTHS_NOM = ['Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень', 'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth();
  let selected = null;

  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const displayLabel = (d) => `${d.getDate()} ${MONTHS_GEN[d.getMonth()]} ${d.getFullYear()}`;

  function render() {
    monthLabel.textContent = `${MONTHS_NOM[viewMonth]} ${viewYear}`;
    grid.innerHTML = '';

    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    let startOffset = firstOfMonth.getDay() - 1;
    if (startOffset < 0) startOffset = 6;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < startOffset; i++) {
      const empty = document.createElement('span');
      empty.className = 'cd-day cd-empty';
      grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(viewYear, viewMonth, day);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cd-day';
      btn.textContent = String(day);
      if (d < today) btn.disabled = true;
      if (d.getTime() === today.getTime()) btn.classList.add('cd-today');
      if (selected && d.getTime() === selected.getTime()) btn.classList.add('cd-selected');
      btn.addEventListener('click', () => {
        selected = d;
        native.value = iso(d);
        valueEl.textContent = displayLabel(d);
        trigger.classList.add('has-value');
        wrap.classList.remove('field-invalid');
        native.dispatchEvent(new Event('change', { bubbles: true }));
        close();
      });
      grid.appendChild(btn);
    }

    prevBtn.disabled = viewYear === today.getFullYear() && viewMonth === today.getMonth();
  }

  function open() {
    closeAllCustomPanels(wrap);
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    render();
  }
  function close() {
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', () => (panel.hidden ? open() : close()));
  prevBtn.addEventListener('click', () => {
    viewMonth--;
    if (viewMonth < 0) { viewMonth = 11; viewYear--; }
    render();
  });
  nextBtn.addEventListener('click', () => {
    viewMonth++;
    if (viewMonth > 11) { viewMonth = 0; viewYear++; }
    render();
  });
  trigger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); panel.hidden ? open() : close(); }
    else if (e.key === 'Escape') close();
  });

  render();
}

document.querySelectorAll('.custom-date').forEach(enhanceCustomDate);

// Закриття кастомних панелей по кліку поза ними / Escape
document.addEventListener('click', (e) => {
  if (!e.target.closest('.custom-select, .custom-date')) closeAllCustomPanels();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeAllCustomPanels();
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
