const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' })); // Para imágenes base64 grandes

const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) return console.error(err.message);
  console.log('Conectado a SQLite');
});

// Crear tabla si no existe
db.run(`CREATE TABLE IF NOT EXISTS memories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  photoUrl TEXT
)`);

// Obtener todos los recuerdos
app.get('/api/memories', (req, res) => {
  db.all('SELECT * FROM memories ORDER BY date ASC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Crear un recuerdo nuevo
app.post('/api/memories', (req, res) => {
  const { date, title, description, photoUrl } = req.body;
  if (!date || !title) return res.status(400).json({ error: 'Faltan campos requeridos' });

  const sql = `INSERT INTO memories (date, title, description, photoUrl) VALUES (?, ?, ?, ?)`;
  db.run(sql, [date, title, description || '', photoUrl || ''], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: this.lastID, date, title, description, photoUrl });
  });
});

// Borrar un recuerdo por ID
app.delete('/api/memories/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM memories WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Recuerdo no encontrado' });
    res.json({ message: 'Recuerdo eliminado' });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
