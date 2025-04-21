const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs");
const XLSX = require("xlsx");

const app = express();
const PORT = 3002;

app.use(cors());
app.use(bodyParser.json());

const getWorkbookPath = (eventName) => `./data/${eventName}.xlsx`;

const dataDir = "./data";
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Get list of all events
app.get("/events", (req, res) => {
  try {
    const files = fs.readdirSync(dataDir);
    const events = files.filter(f => f.endsWith(".xlsx")).map(f => f.replace(".xlsx", ""));
    res.json({ events });
  } catch (err) {
    console.error("Error reading events:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new event
app.post("/events", (req, res) => {
  const { eventName, totalBudget } = req.body;
  if (!eventName || typeof totalBudget !== "number") {
    return res.status(400).json({ error: "Missing event name or total budget" });
  }

  const path = getWorkbookPath(eventName);
  if (fs.existsSync(path)) return res.status(400).json({ error: "Event already exists" });

  try {
    const wb = XLSX.utils.book_new();
    wb.Props = { Title: eventName, Subject: "Budget Event", Author: "BudgetApp", Keywords: `budget,totalBudget=${totalBudget}` };
    const placeholder = XLSX.utils.json_to_sheet([]);
    XLSX.utils.book_append_sheet(wb, placeholder, "General");
    XLSX.writeFile(wb, path);
    res.json({ message: "Event created" });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// Get event details
app.get("/event/:eventName", (req, res) => {
  const eventName = req.params.eventName;
  const path = getWorkbookPath(eventName);
  if (!fs.existsSync(path)) return res.status(404).json({ error: "Event not found" });

  try {
    const wb = XLSX.readFile(path);
    const data = {};

    wb.SheetNames.forEach(name => {
      data[name] = XLSX.utils.sheet_to_json(wb.Sheets[name]);
    });

    let totalBudget = 100000;
    const keywordMatch = wb.Props?.Keywords?.match(/totalBudget=(\d+)/);
    if (keywordMatch) totalBudget = parseFloat(keywordMatch[1]);

    res.json({ sections: data, totalBudget });
  } catch (err) {
    console.error("Error loading event:", err);
    res.status(500).json({ error: "Failed to load event" });
  }
});

// Update event details
app.post("/event/:eventName", (req, res) => {
  const eventName = req.params.eventName;
  const { sections, totalBudget } = req.body;
  const path = getWorkbookPath(eventName);

  try {
    const wb = XLSX.utils.book_new();
    wb.Props = { Keywords: `totalBudget=${totalBudget}` };

    for (const sectionName in sections) {
      const sheet = XLSX.utils.json_to_sheet(sections[sectionName]);
      XLSX.utils.book_append_sheet(wb, sheet, sectionName);
    }

    XLSX.writeFile(wb, path);
    res.json({ message: "Event updated" });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// Delete event
app.delete("/event/:eventName", (req, res) => {
  const eventName = req.params.eventName;
  const path = getWorkbookPath(eventName);

  // Check if event exists
  if (!fs.existsSync(path)) return res.status(404).json({ error: "Event not found" });

  try {
    // Delete the event file
    fs.unlinkSync(path);
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Failed to delete event" });
  }
});
app.get('/test.html', (req, res) => {
  res.sendFile((__dirname+'/test.html'));  // Ensure this points to the correct location
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

