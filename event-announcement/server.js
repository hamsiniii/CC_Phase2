// ========================= BACKEND (server.js) =========================

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const PORT = 3001;
const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const ADMIN_PASSWORD = 'admin123'; // Change for production use

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // Needed to parse urlencoded bodies
app.use(express.static(__dirname));
app.use('/uploads', express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

const getEventFilePath = (event) => path.join(DATA_DIR, `${event}.json`);

app.get('/events', (_, res) => {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  const events = files.map(file => {
    const event = file.replace('.json', '');
    const posts = JSON.parse(fs.readFileSync(getEventFilePath(event), 'utf8'));
    const isNew = posts.some(p => (Date.now() - new Date(p.time)) < 24 * 60 * 60 * 1000);
    return { event, isNew };
  });
  res.json(events);
});

app.get('/announcements/:event', (req, res) => {
  const filePath = getEventFilePath(req.params.event);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Event not found' });
  const posts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  res.json(posts);
});

app.post('/announcements/:event', upload.single('poster'), (req, res) => {
  const { event } = req.params;
  const { heading, body, password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: 'Invalid password' });

  const filePath = getEventFilePath(event);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Event not found' });

  const posts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const poster = req.file ? `/uploads/${req.file.filename}` : null;

  posts.push({
    id: Date.now(),
    heading,
    body,
    poster,
    time: new Date().toISOString()
  });

  fs.writeFileSync(filePath, JSON.stringify(posts, null, 2));
  res.json({ success: true });
});

app.post('/events', (req, res) => {
  const { eventName, password } = req.body;
  if (password !== ADMIN_PASSWORD) return res.status(403).json({ error: 'Invalid password' });
  if (!eventName || typeof eventName !== 'string') return res.status(400).json({ error: 'Invalid event name' });

  const sanitized = eventName.trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const filePath = getEventFilePath(sanitized);

  if (fs.existsSync(filePath)) return res.status(400).json({ error: 'Event already exists' });

  fs.writeFileSync(filePath, '[]', 'utf8');
  res.json({ success: true });
});

app.delete('/announcements/:event/:id', express.json(), (req, res) => {
  const { event, id } = req.params;
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Invalid password' });
  }

  const filePath = getEventFilePath(event);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Event not found' });
  }

  try {
    const posts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const index = posts.findIndex(p => String(p.id) === String(id));
    if (index === -1) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    const [deleted] = posts.splice(index, 1);

    // Delete poster file if exists
    if (deleted.poster) {
      const posterPath = path.join(__dirname, deleted.poster.replace('/uploads/', 'uploads/')); // Correct path construction
      if (fs.existsSync(posterPath)) {
        fs.unlinkSync(posterPath);
      }
    }

    fs.writeFileSync(filePath, JSON.stringify(posts, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.delete('/events/:event', express.json(), (req, res) => {
  const { event } = req.params;
  const { password } = req.body;

  if (password !== ADMIN_PASSWORD) {
    return res.status(403).json({ error: 'Invalid password' });
  }

  const filePath = getEventFilePath(event);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Event not found' });
  }

  try {
    const posts = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    posts.forEach(p => {
      if (p.poster) {
        const posterPath = path.join(__dirname, p.poster.replace('/uploads/', 'uploads/')); // Correct path construction
        if (fs.existsSync(posterPath)) {
          fs.unlinkSync(posterPath);
        }
      }
    });

    fs.unlinkSync(filePath);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "test.html"));
});

app.listen(PORT, () => {
  console.log(`📢 Announcement service running at http://localhost:${PORT}`);
});

