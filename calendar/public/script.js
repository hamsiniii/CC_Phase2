let events = [];
let selectedDate = new Date();
let currentMonth = new Date();

async function loadEvents() {
  const res = await fetch('/events');
  events = await res.json();
  renderCalendar();
  renderEventList();
}

function renderCalendar() {
  const calendarGrid = document.getElementById('calendarGrid');
  calendarGrid.innerHTML = '';

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  document.getElementById('monthYear').textContent = currentMonth.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Previous month placeholders
  const prevLastDay = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarGrid.innerHTML += `<div class="day prev-date">${prevLastDay - i}</div>`;
  }

  const todayStr = new Date().toLocaleDateString('en-CA');
  const selectedStr = selectedDate.toLocaleDateString('en-CA');

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toLocaleDateString('en-CA');

    let classList = 'day';
    if (dateStr === todayStr) classList += ' today';
    if (dateStr === selectedStr) classList += ' active';
    if (events.some(e => e.date === dateStr)) classList += ' event';

    calendarGrid.innerHTML += `<div class="${classList}" data-date="${dateStr}">${day}</div>`;
  }

  // Add next month placeholders
  const lastDay = new Date(year, month + 1, 0).getDay();
  for (let j = 1; j <= 6 - lastDay; j++) {
    calendarGrid.innerHTML += `<div class="day next-date">${j}</div>`;
  }

  addDayClickListeners();
}

function addDayClickListeners() {
  const days = document.querySelectorAll('.day');
  days.forEach(day => {
    day.addEventListener('click', e => {
      const dateStr = day.getAttribute('data-date');
      if (!dateStr) return;
      selectedDate = new Date(dateStr);
      renderCalendar();
      renderEventList();
    });
  });
}

function renderEventList() {
  const dateStr = selectedDate.toLocaleDateString('en-CA');
  const eventList = document.getElementById('eventList');
  const eventDay = document.getElementById('eventDay');
  const eventDate = document.getElementById('eventDate');

  eventDay.textContent = selectedDate.toLocaleString('default', { weekday: 'short' });
  eventDate.textContent = selectedDate.toLocaleDateString('en-US', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  eventList.innerHTML = '';
  const dayEvents = events.filter(e => e.date === dateStr);
  if (dayEvents.length === 0) {
    eventList.innerHTML = `<div class="no-event"><h3>No Events</h3></div>`;
    return;
  }

  dayEvents.forEach((e, i) => {
    const li = document.createElement('li');
    li.className = 'event';
    li.innerHTML = `
      <div class="title">
        <i class="fas fa-circle"></i>
        <h3 class="event-title">${e.title}</h3>
      </div>
      <div class="event-time">${e.start} - ${e.end}</div>
    `;
    li.addEventListener('click', () => deleteEvent(dateStr, i));
    eventList.appendChild(li);
  });
}

async function deleteEvent(date, index) {
  const confirmDel = confirm("Delete this event?");
  if (!confirmDel) return;
  await fetch(`/events/${date}/${index}`, { method: 'DELETE' });
  loadEvents();
}

document.getElementById('eventForm').onsubmit = async (e) => {
  e.preventDefault();
  const title = document.getElementById('eventTitle').value;
  const start = document.getElementById('startTime').value;
  const end = document.getElementById('endTime').value;
  const date = selectedDate.toLocaleDateString('en-CA');

  if (!title || !start || !end) return alert('All fields required');
  if (start >= end) return alert('Start time must be before end time');

  await fetch('/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, title, start, end })
  });

  e.target.reset();
  loadEvents();
};

function prevMonth() {
  currentMonth.setMonth(currentMonth.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentMonth.setMonth(currentMonth.getMonth() + 1);
  renderCalendar();
}

function goToToday() {
  selectedDate = new Date();
  currentMonth = new Date();
  renderCalendar();
  renderEventList();
}

function goToMonth() {
  const val = document.getElementById('monthPicker').value;
  const parts = val.split('/');
  if (parts.length === 2) {
    const [monthStr, yearStr] = parts;
    const month = parseInt(monthStr, 10) - 1;
    const year = parseInt(yearStr, 10);
    if (!isNaN(month) && !isNaN(year)) {
      currentMonth = new Date(year, month);
      selectedDate = new Date(year, month, 1);
      renderCalendar();
      renderEventList();
    }
  } else {
    alert('Enter date as mm/yyyy');
  }
}

loadEvents();

