import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialSettings, initialItems, initialQuotes } from './initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_DATA_DIR = path.resolve(__dirname, '../data');
const DATA_DIR = process.env.LGP_DATA_DIR || DEFAULT_DATA_DIR;

const ITEMS_FILE = path.join(DATA_DIR, 'items.json');
const QUOTES_FILE = path.join(DATA_DIR, 'quotes.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const BACKUPS_FILE = path.join(DATA_DIR, 'backups.json');

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    // If custom DATA_DIR was specified and files do not exist yet, copy from DEFAULT_DATA_DIR if available
    if (DATA_DIR !== DEFAULT_DATA_DIR) {
      const files = ['settings.json', 'items.json', 'quotes.json', 'backups.json'];
      for (const file of files) {
        const dest = path.join(DATA_DIR, file);
        const src = path.join(DEFAULT_DATA_DIR, file);
        try {
          await fs.access(dest);
        } catch {
          try {
            const content = await fs.readFile(src, 'utf-8');
            await fs.writeFile(dest, content, 'utf-8');
          } catch {}
        }
      }
    }
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

async function readFileOrDefault(filePath, defaultData) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await writeFileAtomic(filePath, defaultData);
      return defaultData;
    }
    console.error(`Error reading ${filePath}:`, err);
    return defaultData;
  }
}

async function writeFileAtomic(filePath, data) {
  await ensureDataDir();
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(tempPath, json, 'utf-8');
  await fs.rename(tempPath, filePath);
}

export const Storage = {
  async init() {
    await ensureDataDir();
    await readFileOrDefault(SETTINGS_FILE, initialSettings);
    await readFileOrDefault(ITEMS_FILE, initialItems);
    await readFileOrDefault(QUOTES_FILE, initialQuotes);
    await readFileOrDefault(BACKUPS_FILE, []);
    console.log('✅ Base de datos LGP inicializada correctamente.');
  },

  // ITEMS / TARIFARIO
  async getItems() {
    return await readFileOrDefault(ITEMS_FILE, initialItems);
  },

  async saveItems(items) {
    await writeFileAtomic(ITEMS_FILE, items);
    return items;
  },

  async addItem(item) {
    const items = await this.getItems();
    const newItem = {
      id: item.id || `itm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      code: item.code || `ART-${items.length + 1}`,
      name: item.name || 'Sin título',
      category: item.category || 'General',
      unit: item.unit || 'unidad',
      price: Number(item.price) || 0,
      description: item.description || '',
      updatedAt: new Date().toISOString()
    };
    items.unshift(newItem);
    await this.saveItems(items);
    return newItem;
  },

  async updateItem(id, itemUpdate) {
    const items = await this.getItems();
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return null;
    items[index] = {
      ...items[index],
      ...itemUpdate,
      price: Number(itemUpdate.price !== undefined ? itemUpdate.price : items[index].price),
      updatedAt: new Date().toISOString()
    };
    await this.saveItems(items);
    return items[index];
  },

  async deleteItem(id) {
    const items = await this.getItems();
    const filtered = items.filter(i => i.id !== id);
    await this.saveItems(filtered);
    return true;
  },

  // QUOTES / PRESUPUESTOS
  async getQuotes() {
    return await readFileOrDefault(QUOTES_FILE, initialQuotes);
  },

  async getQuoteById(id) {
    const quotes = await this.getQuotes();
    return quotes.find(q => q.id === id) || null;
  },

  async saveQuotes(quotes) {
    await writeFileAtomic(QUOTES_FILE, quotes);
    return quotes;
  },

  async createQuote(quoteData) {
    const quotes = await this.getQuotes();
    const settings = await this.getSettings();

    let quoteNumber = quoteData.number;
    if (!quoteNumber) {
      const nextNum = settings.nextQuoteNumber || (quotes.length + 1001);
      quoteNumber = `${settings.quotePrefix || 'LGP-'}${new Date().getFullYear()}-${nextNum}`;
      settings.nextQuoteNumber = nextNum + 1;
      await this.saveSettings(settings);
    }

    const newQuote = {
      ...quoteData,
      id: quoteData.id || `quote-${Date.now()}`,
      number: quoteNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    quotes.unshift(newQuote);
    await this.saveQuotes(quotes);
    return newQuote;
  },

  async updateQuote(id, quoteData) {
    const quotes = await this.getQuotes();
    const index = quotes.findIndex(q => q.id === id);
    if (index === -1) return null;

    quotes[index] = {
      ...quotes[index],
      ...quoteData,
      id: quotes[index].id,
      updatedAt: new Date().toISOString()
    };

    await this.saveQuotes(quotes);
    return quotes[index];
  },

  async deleteQuote(id) {
    const quotes = await this.getQuotes();
    const filtered = quotes.filter(q => q.id !== id);
    await this.saveQuotes(filtered);
    return true;
  },

  // WIPED BACKUPS ("Nuevo/Limpiar" auto-snapshots)
  async getWipedBackups() {
    return await readFileOrDefault(BACKUPS_FILE, []);
  },

  async addWipedBackup(quoteData) {
    const backups = await this.getWipedBackups();
    const backupEntry = {
      ...quoteData,
      backupId: `bkp-${Date.now()}`,
      wipedAt: new Date().toISOString()
    };
    backups.unshift(backupEntry);
    // Keep last 50 cleared backups
    const trimmed = backups.slice(0, 50);
    await writeFileAtomic(BACKUPS_FILE, trimmed);
    return backupEntry;
  },

  async deleteWipedBackup(backupId) {
    const backups = await this.getWipedBackups();
    const filtered = backups.filter(b => b.backupId !== backupId);
    await writeFileAtomic(BACKUPS_FILE, filtered);
    return true;
  },

  // SETTINGS
  async getSettings() {
    return await readFileOrDefault(SETTINGS_FILE, initialSettings);
  },

  async saveSettings(settings) {
    const current = await this.getSettings();
    const updated = { ...current, ...settings, updatedAt: new Date().toISOString() };
    await writeFileAtomic(SETTINGS_FILE, updated);
    return updated;
  },

  // BACKUP & RESTORE
  async getFullBackup() {
    return {
      backupDate: new Date().toISOString(),
      version: "1.0",
      company: "LGP",
      settings: await this.getSettings(),
      items: await this.getItems(),
      quotes: await this.getQuotes(),
      backups: await this.getWipedBackups()
    };
  },

  async restoreFullBackup(data) {
    if (!data || !data.items || !data.quotes) {
      throw new Error('Formato de copia de seguridad inválido');
    }
    if (data.settings) await this.saveSettings(data.settings);
    if (Array.isArray(data.items)) await this.saveItems(data.items);
    if (Array.isArray(data.quotes)) await this.saveQuotes(data.quotes);
    if (Array.isArray(data.backups)) await writeFileAtomic(BACKUPS_FILE, data.backups);
    return true;
  }
};
