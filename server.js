const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'submissions.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeData(data) {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

app.post('/api/submit', (req, res) => {
  const { nama, nohp, saran, keluhan } = req.body;

  if (!nama || !nama.trim()) {
    return res.status(400).json({ error: 'Nama lengkap wajib diisi' });
  }
  if (!nohp || !nohp.trim()) {
    return res.status(400).json({ error: 'Nomor HP wajib diisi' });
  }
  if (nohp.replace(/[^0-9]/g, '').length < 10) {
    return res.status(400).json({ error: 'Nomor HP minimal 10 digit' });
  }
  if ((!saran || !saran.trim()) && (!keluhan || !keluhan.trim())) {
    return res.status(400).json({ error: 'Saran/masukan atau keluhan wajib diisi' });
  }

  const submissions = readData();
  const newId = submissions.length > 0 ? submissions[submissions.length - 1].id + 1 : 1;

  const entry = {
    id: newId,
    nama: nama.trim(),
    nohp: nohp.trim(),
    saran: (saran || '').trim(),
    keluhan: (keluhan || '').trim(),
    waktu: new Date().toISOString()
  };

  submissions.push(entry);
  writeData(submissions);

  res.json({ success: true, id: newId });
});

app.get('/api/submissions', (req, res) => {
  const submissions = readData();
  res.json(submissions);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
