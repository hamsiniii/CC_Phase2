const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3010;

const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');

app.use(express.json());
app.use(express.static('public')); 

// Load bookings
function loadBookings() {
  if (!fs.existsSync(BOOKINGS_FILE)) return [];
  const data = fs.readFileSync(BOOKINGS_FILE);
  return JSON.parse(data);
}

// Save bookings
function saveBookings(bookings) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
}

// Get all bookings
app.get('/bookings', (req, res) => {
  const bookings = loadBookings();
  res.json(bookings);
});

// Add a new booking with double booking check
app.post('/bookings', (req, res) => {
  const { event, name, phone, venue, date, startTime, endTime } = req.body;

  if (!event || !name || !phone || !venue || !date || !startTime || !endTime) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Validate time logic
  if (endTime <= startTime) {
    return res.status(400).json({ error: 'End time must be after start time' });
  }

  const bookings = loadBookings();

  const doubleBooked = bookings.some(b =>
    b.venue === venue &&
    b.date === date &&
    (
      (startTime >= b.startTime && startTime < b.endTime) ||
      (endTime > b.startTime && endTime <= b.endTime) ||
      (startTime <= b.startTime && endTime >= b.endTime)
    )
  );

  if (doubleBooked) {
    return res.status(400).json({ error: 'Venue already booked for this time slot' });
  }

  const newBooking = {
    id: Date.now(),
    event,
    name,
    phone,
    venue,
    date,
    startTime,
    endTime
  };

  bookings.push(newBooking);
  saveBookings(bookings);
  res.status(201).json(newBooking);
});

// Delete a booking
app.delete('/bookings/:id', (req, res) => {
  const bookings = loadBookings();
  const updatedBookings = bookings.filter(b => b.id !== parseInt(req.params.id));
  saveBookings(updatedBookings);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

