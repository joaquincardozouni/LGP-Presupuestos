import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Storage } from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Init Storage
await Storage.init();

// --- API ENDPOINTS ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'LGP Presupuestos API', time: new Date() });
});

// Settings
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await Storage.getSettings();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const updated = await Storage.saveSettings(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Items / Catalog
app.get('/api/items', async (req, res) => {
  try {
    const items = await Storage.getItems();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const newItem = await Storage.addItem(req.body);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    const updated = await Storage.updateItem(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Item no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    await Storage.deleteItem(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quotes / Presupuestos
app.get('/api/quotes', async (req, res) => {
  try {
    const quotes = await Storage.getQuotes();
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/quotes/:id', async (req, res) => {
  try {
    const quote = await Storage.getQuoteById(req.params.id);
    if (!quote) return res.status(404).json({ error: 'Presupuesto no encontrado' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/quotes', async (req, res) => {
  try {
    const newQuote = await Storage.createQuote(req.body);
    res.status(201).json(newQuote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/quotes/:id', async (req, res) => {
  try {
    const updated = await Storage.updateQuote(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Presupuesto no encontrado' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/quotes/:id', async (req, res) => {
  try {
    await Storage.deleteQuote(req.params.id);
    res.json({ success: true, id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Wiped Backups ("Nuevo/Limpiar" auto-snapshots)
app.get('/api/backups', async (req, res) => {
  try {
    const backups = await Storage.getWipedBackups();
    res.json(backups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/backups', async (req, res) => {
  try {
    const backup = await Storage.addWipedBackup(req.body);
    res.status(201).json(backup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/backups/:id', async (req, res) => {
  try {
    await Storage.deleteWipedBackup(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Backup & Restore
app.get('/api/backup', async (req, res) => {
  try {
    const backup = await Storage.getFullBackup();
    res.setHeader('Content-Disposition', `attachment; filename=LGP_Backup_${new Date().toISOString().split('T')[0]}.json`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(backup, null, 2));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/restore', async (req, res) => {
  try {
    await Storage.restoreFullBackup(req.body);
    res.json({ success: true, message: 'Datos restaurados con éxito' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Serve frontend in production (dist directory)
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Catch-all route to serve SPA
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`   🚀 SISTEMA LGP PRESUPUESTOS INICIADO `);
  console.log(`   📡 Servidor API: http://localhost:${PORT}`);
  console.log(`=========================================`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Aviso: Puerto ${PORT} en uso.`);
  } else {
    console.error('Error del servidor:', err);
  }
});
