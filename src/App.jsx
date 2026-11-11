import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import CatalogModule from './components/CatalogModule';
import QuoteGenerator from './components/QuoteGenerator';
import M2CalculatorModule from './components/M2CalculatorModule';
import QuoteHistory from './components/QuoteHistory';
import PrintQuoteView from './components/PrintQuoteView';
import SettingsModule from './components/SettingsModule';
import { api } from './api';
import { Loader2 } from 'lucide-react';

const DRAFT_STORAGE_KEY = 'lgp_active_draft_v1';

function createInitialEmptyQuote(stg = {}) {
  const today = new Date().toISOString().split('T')[0];
  const validUntilDate = new Date();
  validUntilDate.setDate(validUntilDate.getDate() + (stg.defaultValidityDays || 15));
  const validUntil = validUntilDate.toISOString().split('T')[0];

  return {
    number: '',
    date: today,
    validUntil: validUntil,
    status: 'Pendiente',
    client: {
      name: '',
      company: '',
      taxId: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    },
    items: [
      {
        id: `qi-${Date.now()}-1`,
        itemId: null,
        title: 'Trabajo / Material a convenir',
        description: '',
        unit: 'unidad',
        quantity: 1,
        unitPrice: 0,
        itemDiscount: 0,
        subtotal: 0
      }
    ],
    checks: {
      applyIva: true,
      ivaRate: stg.defaultIva !== undefined ? stg.defaultIva : 21,
      applyDiscount: false,
      discountType: 'percent',
      discountValue: 0,
      applyOtherTax: false,
      otherTaxName: 'Percepción IIBB',
      otherTaxRate: 3.5,
      applyShipping: false,
      shippingAmount: 0,
      shippingNote: 'Flete y descarga en obra',
      applyLaborExtra: false,
      laborExtraAmount: 0,
      laborExtraNote: '',
      includeTerms: true,
      includeSignatures: true,
      paymentCondition: '50% anticipo al iniciar y 50% contra entrega'
    },
    currency: stg.currency || 'ARS',
    currencySymbol: stg.currencySymbol || '$',
    terms: stg.defaultTerms || '',
    notes: '',
    totals: {
      subtotal: 0,
      discountAmount: 0,
      netSubtotal: 0,
      ivaAmount: 0,
      otherTaxAmount: 0,
      shippingAmount: 0,
      laborExtraAmount: 0,
      grandTotal: 0
    }
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Core Data
  const [settings, setSettings] = useState({});
  const [items, setItems] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [backups, setBackups] = useState([]);

  // Active Persistent Draft (survives tab switches and refreshes!)
  const [draftQuote, setDraftQuote] = useState(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error reading saved draft:', e);
    }
    return null;
  });

  const [quoteForPrint, setQuoteForPrint] = useState(null);

  // Keep draft persisted to localStorage whenever it changes
  useEffect(() => {
    if (draftQuote) {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftQuote));
      } catch (e) {
        console.error('Error saving draft to storage:', e);
      }
    }
  }, [draftQuote]);

  // Initial Data Load
  const loadAllData = async () => {
    try {
      setLoading(true);
      const [stgs, itms, qts, bkps] = await Promise.all([
        api.getSettings(),
        api.getItems(),
        api.getQuotes(),
        api.getBackups().catch(() => [])
      ]);
      setSettings(stgs || {});
      setItems(itms || []);
      setQuotes(qts || []);
      setBackups(bkps || []);

      // If draftQuote is not set yet, initialize with loaded settings
      setDraftQuote(prev => {
        if (!prev) return createInitialEmptyQuote(stgs || {});
        // Ensure defaults if missing
        return {
          ...prev,
          checks: {
            includeTerms: true,
            includeSignatures: true,
            ...(prev.checks || {})
          }
        };
      });

      setError(null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('No se pudo conectar con el servidor local.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Save quote handler
  const handleSaveQuote = async (quoteData) => {
    try {
      let saved;
      if (quoteData.id && quotes.some(q => q.id === quoteData.id)) {
        saved = await api.updateQuote(quoteData.id, quoteData);
      } else {
        saved = await api.createQuote(quoteData);
      }
      await loadAllData();
      setDraftQuote(saved);
      return saved;
    } catch (err) {
      alert('Error al guardar presupuesto: ' + err.message);
      return null;
    }
  };

  // Reset / Clear quote with automatic snapshot backup!
  const handleResetQuote = async () => {
    // If the active draft has meaningful data, store a backup snapshot before wiping
    if (draftQuote && (draftQuote.client?.name || (draftQuote.items && draftQuote.items.length > 0 && draftQuote.items[0].title))) {
      try {
        const savedBkp = await api.createBackup(draftQuote);
        setBackups(prev => [savedBkp, ...prev]);
      } catch (err) {
        console.error('Error saving wiped backup:', err);
      }
    }

    const fresh = createInitialEmptyQuote(settings);
    setDraftQuote(fresh);
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(fresh));
    } catch (e) {}
  };

  // Edit an existing saved quote
  const handleEditQuote = (quote) => {
    setDraftQuote(quote);
    setActiveTab('quote');
  };

  // View for printing
  const handleViewQuote = (quote) => {
    setQuoteForPrint(quote);
    setActiveTab('print');
  };

  // Duplicate quote
  const handleDuplicateQuote = async (quoteToDup) => {
    try {
      const duplicated = {
        ...quoteToDup,
        id: undefined,
        number: undefined,
        status: 'Borrador',
        date: new Date().toISOString().split('T')[0],
        client: {
          ...quoteToDup.client,
          name: `${quoteToDup.client?.name || ''} (Copia)`
        }
      };
      const created = await api.createQuote(duplicated);
      await loadAllData();
      setDraftQuote(created);
      setActiveTab('quote');
    } catch (err) {
      alert('Error al duplicar: ' + err.message);
    }
  };

  // Delete quote
  const handleDeleteQuote = async (id) => {
    try {
      await api.deleteQuote(id);
      await loadAllData();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  // Quick update status
  const handleUpdateQuoteStatus = async (id, status) => {
    try {
      await api.updateQuote(id, { status });
      await loadAllData();
    } catch (err) {
      alert('Error al actualizar estado: ' + err.message);
    }
  };

  // Restore a wiped backup into the active draft
  const handleRestoreWipedBackup = (backup) => {
    const { backupId, wipedAt, ...restoredData } = backup;
    setDraftQuote(restoredData);
    setActiveTab('quote');
  };

  const handleDeleteWipedBackup = async (backupId) => {
    try {
      await api.deleteBackup(backupId);
      setBackups(prev => prev.filter(b => b.backupId !== backupId));
    } catch (err) {
      console.error('Error deleting backup:', err);
    }
  };

  // Handlers for Items
  const handleSaveItem = async (itemData) => {
    try {
      if (itemData.id) {
        await api.updateItem(itemData.id, itemData);
      } else {
        await api.createItem(itemData);
      }
      await loadAllData();
    } catch (err) {
      alert('Error al guardar ítem: ' + err.message);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.deleteItem(id);
      await loadAllData();
    } catch (err) {
      alert('Error al eliminar ítem: ' + err.message);
    }
  };

  // Handlers for Settings & Restore
  const handleSaveSettings = async (settingsData) => {
    try {
      const updated = await api.updateSettings(settingsData);
      setSettings(updated);
      await loadAllData();
    } catch (err) {
      alert('Error al guardar ajustes: ' + err.message);
    }
  };

  const handleRestoreBackup = async (backupData) => {
    try {
      await api.restoreBackup(backupData);
      await loadAllData();
      alert('Copia de seguridad restaurada correctamente.');
    } catch (err) {
      alert('Error al restaurar: ' + err.message);
    }
  };

  // Send calculated m2 item directly into Quote
  const handleAddCalculatedItemToQuote = (calculatedItem) => {
    const current = draftQuote || createInitialEmptyQuote(settings);
    const existingItems = current.items || [];
    
    // If the only existing item is empty default placeholder, replace it
    let updatedItems;
    if (existingItems.length === 1 && !existingItems[0].title?.trim()) {
      updatedItems = [calculatedItem];
    } else {
      updatedItems = [...existingItems, calculatedItem];
    }

    const updatedQuote = {
      ...current,
      items: updatedItems
    };

    setDraftQuote(updatedQuote);
    setActiveTab('quote');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans selection:bg-brand-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        quoteCount={quotes.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {loading ? (
          <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
            <p className="text-sm font-semibold">Cargando...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl max-w-lg mx-auto text-center space-y-3">
            <p className="font-bold">{error}</p>
            <button
              onClick={loadAllData}
              className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
            >
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                quotes={quotes}
                items={items}
                settings={settings}
                onEditQuote={handleEditQuote}
                onViewQuote={handleViewQuote}
                setActiveTab={setActiveTab}
              />
            )}

            {activeTab === 'quote' && (
              <QuoteGenerator
                quote={draftQuote || createInitialEmptyQuote(settings)}
                setQuote={setDraftQuote}
                itemsCatalog={items}
                settings={settings}
                onSaveQuote={handleSaveQuote}
                onViewQuote={handleViewQuote}
                onOpenM2Calculator={() => setActiveTab('m2calc')}
                onResetQuote={handleResetQuote}
              />
            )}

            {activeTab === 'catalog' && (
              <CatalogModule
                items={items}
                settings={settings}
                onSaveItem={handleSaveItem}
                onDeleteItem={handleDeleteItem}
              />
            )}

            {activeTab === 'm2calc' && (
              <M2CalculatorModule
                itemsCatalog={items}
                settings={settings}
                onAddCalculatedItemToQuote={handleAddCalculatedItemToQuote}
              />
            )}

            {activeTab === 'history' && (
              <QuoteHistory
                quotes={quotes}
                backups={backups}
                settings={settings}
                onViewQuote={handleViewQuote}
                onEditQuote={handleEditQuote}
                onDuplicateQuote={handleDuplicateQuote}
                onDeleteQuote={handleDeleteQuote}
                onUpdateStatus={handleUpdateQuoteStatus}
                onRestoreWipedBackup={handleRestoreWipedBackup}
                onDeleteWipedBackup={handleDeleteWipedBackup}
              />
            )}

            {activeTab === 'print' && (
              <PrintQuoteView
                quote={quoteForPrint || draftQuote}
                settings={settings}
                onBackToEdit={() => setActiveTab('quote')}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsModule
                settings={settings}
                onSaveSettings={handleSaveSettings}
                onRestoreBackup={handleRestoreBackup}
              />
            )}
          </>
        )}

      </main>

    </div>
  );
}
