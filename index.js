const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Ruta para obtener todos los recuerdos
app.get('/memories', (req, res) => {
  const filePath = path.join(__dirname, 'memories.json');
  if (!fs.existsSync(filePath)) {
    // Si no existe el archivo, respondemos con lista vacía
    return res.json([]);
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  const memories = JSON.parse(data);
  res.json(memories);
});

// Ruta para agregar un recuerdo nuevo
app.post('/memories', (req, res) => {
  const newMemory = req.body;

  if (!newMemory.title || !newMemory.date) {
    return res.status(400).json({ error: 'Faltan datos requeridos' });
  }

  const filePath = path.join(__dirname, 'memories.json');
  let memories = [];
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf-8');
    memories = JSON.parse(data);
  }

  // Añadimos un id simple para identificar cada recuerdo
  newMemory.id = Date.now();
  memories.push(newMemory);

  fs.writeFileSync(filePath, JSON.stringify(memories, null, 2));

  res.status(201).json(newMemory);
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});
