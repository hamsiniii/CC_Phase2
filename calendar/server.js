const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

const FILE = path.join(__dirname, 'events.json');

app.use(express.static('public'));
app.use(express.json());

function readEvents() {
  if (!fs.existsSync(FILE)) fs.writeFileSync(FILE, '[]');
  return JSON.parse(fs.readFileSync(FILE));
}

function writeEvents(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

app.get('/events', (req, res) => {
  res.json(readEvents());
});

app.post('/events', (req, res) => {
  const all = readEvents();
  all.push(req.body);
  writeEvents(all);
  res.sendStatus(200);
});

app.delete('/events/:date/:index', (req, res) => {
  const date = req.params.date;
  const index = parseInt(req.params.index);
  let all = readEvents();

  const filtered = [];
  for (let e of all) {
    if (e.date === date) {
      const eventsForDay = all.filter(ev => ev.date === date);
      eventsForDay.splice(index, 1);
      all = all.filter(ev => ev.date !== date).concat(eventsForDay);
      break;
    }
  }

  writeEvents(all);
  res.sendStatus(200);
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

