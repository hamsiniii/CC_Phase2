const form = document.getElementById('bookingForm');
const bookingsList = document.getElementById('bookingsList');

function loadBookings() {
  fetch('/bookings')
    .then(res => res.json())
    .then(bookings => {
      bookings.sort((a, b) => {
        const dtA = new Date(`${a.date}T${a.startTime}`);
        const dtB = new Date(`${b.date}T${b.startTime}`);
        return dtA - dtB;
      });

      bookingsList.innerHTML = '';
bookings.forEach(({ id, event, name, phone, venue, date, startTime, endTime }) => {
  const bookingDiv = document.createElement('div');
  bookingDiv.className = 'booking';

  const detailsDiv = document.createElement('div');
  detailsDiv.className = 'booking-details';
  detailsDiv.innerHTML = `
    <strong>${event}</strong> at <em>${venue}</em><br>
    ${date}, ${startTime} to ${endTime}<br>
    <strong>POC:</strong> ${name}, ${phone}
  `;

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.onclick = () => deleteBooking(id);

  bookingDiv.appendChild(detailsDiv);
  bookingDiv.appendChild(deleteBtn);
  bookingsList.appendChild(bookingDiv);
});

    });
}

function deleteBooking(id) {
  fetch(`/bookings/${id}`, { method: 'DELETE' })
    .then(() => loadBookings());
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const formData = new FormData(form);
  const booking = Object.fromEntries(formData.entries());

  // Client-side time validation
  if (booking.endTime <= booking.startTime) {
    alert("End time must be later than start time.");
    return;
  }

  fetch('/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking)
  })
  .then(res => {
    if (!res.ok) {
      return res.json().then(data => { throw new Error(data.error); });
    }
    return res.json();
  })
  .then(() => {
    form.reset();
    loadBookings();
  })
  .catch(err => alert(err.message));
});

loadBookings();

