import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Layers, 
  Calculator, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  CheckSquare, 
  Save, 
  Printer, 
  RefreshCw, 
  Search, 
  X, 
  User, 
  Calendar, 
  DollarSign, 
  Copy
} from 'lucide-react';

export default function QuoteGenerator({ 
  quote,
  setQuote,
  itemsCatalog = [], 
  settings = {}, 
  onSaveQuote, 
  onViewQuote, 
  onOpenM2Calculator,
  onResetQuote 
}) {
  const currencySymbol = settings.currencySymbol || '$';

  // Modal to select items from catalog
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [catalogCategory, setCatalogCategory] = useState('ALL');

  // Success toast message
  const [toastMessage, setToastMessage] = useState('');

  // Recalculate totals whenever items or checks change
  const calculatedTotals = React.useMemo(() => {
    let rawSubtotal = 0;
    const computedItems = (quote.items || []).map(item => {
      const q = parseFloat(item.quantity) || 0;
      const p = parseFloat(item.unitPrice) || 0;
      const d = parseFloat(item.itemDiscount) || 0;
      const itemSub = (q * p) * (1 - (d / 100));
      rawSubtotal += itemSub;
      return { ...item, subtotal: itemSub };
    });

    const checks = quote.checks || {};

    // Global Discount
    let discountAmount = 0;
    if (checks.applyDiscount && checks.discountValue > 0) {
      if (checks.discountType === 'percent') {
        discountAmount = (rawSubtotal * (parseFloat(checks.discountValue) || 0)) / 100;
      } else {
        discountAmount = parseFloat(checks.discountValue) || 0;
      }
    }
    const netSubtotal = Math.max(0, rawSubtotal - discountAmount);

    // IVA
    let ivaAmount = 0;
    if (checks.applyIva && checks.ivaRate > 0) {
      ivaAmount = (netSubtotal * (parseFloat(checks.ivaRate) || 0)) / 100;
    }

    // Other Taxes
    let otherTaxAmount = 0;
    if (checks.applyOtherTax && checks.otherTaxRate > 0) {
      otherTaxAmount = (netSubtotal * (parseFloat(checks.otherTaxRate) || 0)) / 100;
    }

    // Shipping
    let shippingAmount = 0;
    if (checks.applyShipping) {
      shippingAmount = parseFloat(checks.shippingAmount) || 0;
    }

    // Labor extra
    let laborExtraAmount = 0;
    if (checks.applyLaborExtra) {
      laborExtraAmount = parseFloat(checks.laborExtraAmount) || 0;
    }

    // Grand total
    const grandTotal = netSubtotal + ivaAmount + otherTaxAmount + shippingAmount + laborExtraAmount;

    return {
      subtotal: rawSubtotal,
      discountAmount,
      netSubtotal,
      ivaAmount,
      otherTaxAmount,
      shippingAmount,
      laborExtraAmount,
      grandTotal,
      computedItems
    };
  }, [quote.items, quote.checks]);

  // Handle row edits
  const handleItemChange = (index, field, value) => {
    const updated = [...quote.items];
    updated[index] = { ...updated[index], [field]: value };
    setQuote({ ...quote, items: updated });
  };

  // Add blank custom item
  const handleAddBlankItem = () => {
    const newItem = {
      id: `qi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemId: null,
      title: 'Nuevo concepto de obra / herrería',
      description: '',
      unit: 'unidad',
      quantity: 1,
      unitPrice: 0,
      itemDiscount: 0,
      subtotal: 0
    };
    setQuote({ ...quote, items: [...(quote.items || []), newItem] });
  };

  // Add item from catalog
  const handleSelectCatalogItem = (catItem) => {
    const newItem = {
      id: `qi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemId: catItem.id,
      title: catItem.name,
      description: catItem.description || '',
      unit: catItem.unit || 'unidad',
      quantity: 1,
      unitPrice: catItem.price || 0,
      itemDiscount: 0,
      subtotal: catItem.price || 0
    };
    setQuote({ ...quote, items: [...(quote.items || []), newItem] });
    setIsCatalogModalOpen(false);
  };

  // Reorder items
  const handleMoveItem = (index, direction) => {
    const newItems = [...quote.items];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newItems.length) return;
    const temp = newItems[index];
    newItems[index] = newItems[target];
    newItems[target] = temp;
    setQuote({ ...quote, items: newItems });
  };

  // Duplicate item row
  const handleDuplicateItem = (index) => {
    const itemToDup = quote.items[index];
    const duplicated = {
      ...itemToDup,
      id: `qi-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: `${itemToDup.title} (Copia)`
    };
    const updated = [...quote.items];
    updated.splice(index + 1, 0, duplicated);
    setQuote({ ...quote, items: updated });
  };

  // Delete item row
  const handleDeleteItem = (index) => {
    if (quote.items.length <= 1) {
      alert('El presupuesto debe contener al menos un ítem.');
      return;
    }
    const updated = quote.items.filter((_, i) => i !== index);
    setQuote({ ...quote, items: updated });
  };

  // Save quote
  const handleSave = async () => {
    if (!quote.client?.name?.trim()) {
      alert('Por favor ingrese el nombre del cliente.');
      return;
    }

    const payload = {
      ...quote,
      items: calculatedTotals.computedItems,
      totals: {
        subtotal: calculatedTotals.subtotal,
        discountAmount: calculatedTotals.discountAmount,
        netSubtotal: calculatedTotals.netSubtotal,
        ivaAmount: calculatedTotals.ivaAmount,
        otherTaxAmount: calculatedTotals.otherTaxAmount,
        shippingAmount: calculatedTotals.shippingAmount,
        laborExtraAmount: calculatedTotals.laborExtraAmount,
        grandTotal: calculatedTotals.grandTotal
      }
    };

    const saved = await onSaveQuote(payload);
    if (saved) {
      setToastMessage('✅ Presupuesto guardado');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const handlePrint = () => {
    const payload = {
      ...quote,
      items: calculatedTotals.computedItems,
      totals: {
        subtotal: calculatedTotals.subtotal,
        discountAmount: calculatedTotals.discountAmount,
        netSubtotal: calculatedTotals.netSubtotal,
        ivaAmount: calculatedTotals.ivaAmount,
        otherTaxAmount: calculatedTotals.otherTaxAmount,
        shippingAmount: calculatedTotals.shippingAmount,
        laborExtraAmount: calculatedTotals.laborExtraAmount,
        grandTotal: calculatedTotals.grandTotal
      }
    };
    onViewQuote(payload);
  };

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  // Filter catalog items in modal
  const filteredCatalog = itemsCatalog.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
                        (i.code && i.code.toLowerCase().includes(catalogSearch.toLowerCase()));
    const matchCat = catalogCategory === 'ALL' || i.category === catalogCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-bold animate-in slide-in-from-bottom duration-150">
          {toastMessage}
        </div>
      )}

      {/* Top Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-800">
              {quote.number || 'Borrador en curso'}
            </span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Hoja de Presupuesto</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (confirm('¿Desea limpiar el presupuesto actual? Se guardará una copia automática en la pestaña de respaldos.')) {
                onResetQuote();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Limpia el formulario y guarda copia en respaldos"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Nuevo / Limpiar</span>
          </button>

          <button
            onClick={onOpenM2Calculator}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-brand-600" />
            <span>Calcular m²</span>
          </button>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Ver / PDF</span>
          </button>
        </div>
      </div>

      {/* Quote Meta & Client Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Client Info Card */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-600" />
              Datos del Cliente / Obra
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cliente / Razón Social <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Nombre o empresa..."
                value={quote.client?.name || ''}
                onChange={(e) => setQuote({
                  ...quote,
                  client: { ...quote.client, name: e.target.value }
                })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Obra / Referencia
              </label>
              <input
                type="text"
                placeholder="Ej: Portón y Rejas Frente..."
                value={quote.client?.company || ''}
                onChange={(e) => setQuote({
                  ...quote,
                  client: { ...quote.client, company: e.target.value }
                })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono
              </label>
              <input
                type="text"
                placeholder="+54 9 11..."
                value={quote.client?.phone || ''}
                onChange={(e) => setQuote({
                  ...quote,
                  client: { ...quote.client, phone: e.target.value }
                })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ubicación / Dirección de Obra
              </label>
              <input
                type="text"
                placeholder="Localidad o zona..."
                value={quote.client?.address || ''}
                onChange={(e) => setQuote({
                  ...quote,
                  client: { ...quote.client, address: e.target.value }
                })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CUIT / DNI
              </label>
              <input
                type="text"
                placeholder="Opcional..."
                value={quote.client?.taxId || ''}
                onChange={(e) => setQuote({
                  ...quote,
                  client: { ...quote.client, taxId: e.target.value }
                })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="Opcional..."
                value={quote.client?.email || ''}
                onChange={(e) => setQuote({
                  ...quote,
                  client: { ...quote.client, email: e.target.value }
                })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Dates & Status Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              Parámetros
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Número de Presupuesto
            </label>
            <input
              type="text"
              placeholder="(Se genera automáticamente)"
              value={quote.number || ''}
              onChange={(e) => setQuote({ ...quote, number: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha Emisión
              </label>
              <input
                type="date"
                value={quote.date || ''}
                onChange={(e) => setQuote({ ...quote, date: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Válido Hasta
              </label>
              <input
                type="date"
                value={quote.validUntil || ''}
                onChange={(e) => setQuote({ ...quote, validUntil: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Estado Interno
            </label>
            <select
              value={quote.status || 'Pendiente'}
              onChange={(e) => setQuote({ ...quote, status: e.target.value })}
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-semibold"
            >
              <option value="Borrador">Borrador</option>
              <option value="Pendiente">Pendiente de Aprobación</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Facturado">Facturado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>
        </div>

      </div>

      {/* ITEMS TABLE (100% PERSONALIZABLE) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              Ítems y Trabajos
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCatalogModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Añadir desde Tarifario</span>
            </button>

            <button
              onClick={handleAddBlankItem}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Ítem Libre</span>
            </button>
          </div>
        </div>

        {/* Table Rows */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 font-semibold w-8 text-center">#</th>
                <th className="py-2.5 px-3 font-semibold min-w-[260px]">Concepto / Detalle</th>
                <th className="py-2.5 px-3 font-semibold w-24">Unidad</th>
                <th className="py-2.5 px-3 font-semibold w-24 text-right">Cant.</th>
                <th className="py-2.5 px-3 font-semibold w-32 text-right">Precio Unit. ({quote.currencySymbol})</th>
                <th className="py-2.5 px-3 font-semibold w-24 text-right">Desc %</th>
                <th className="py-2.5 px-3 font-semibold w-32 text-right">Subtotal</th>
                <th className="py-2.5 px-3 font-semibold w-24 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(quote.items || []).map((item, index) => {
                const q = parseFloat(item.quantity) || 0;
                const p = parseFloat(item.unitPrice) || 0;
                const d = parseFloat(item.itemDiscount) || 0;
                const lineSubtotal = (q * p) * (1 - (d / 100));

                return (
                  <tr key={item.id || index} className="hover:bg-slate-50/70 transition-colors align-top">
                    
                    <td className="py-2.5 px-3 text-center text-xs font-mono text-slate-400 font-semibold pt-3.5">
                      {index + 1}
                    </td>

                    {/* Title & Description */}
                    <td className="py-2.5 px-3 space-y-1">
                      <input
                        type="text"
                        value={item.title || ''}
                        onChange={(e) => handleItemChange(index, 'title', e.target.value)}
                        placeholder="Título del trabajo..."
                        className="w-full text-xs font-bold text-slate-900 px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                      <textarea
                        rows="2"
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        placeholder="Detalle o medidas..."
                        className="w-full text-[11px] text-slate-600 px-2 py-1 bg-transparent border border-transparent hover:border-slate-200 focus:border-slate-300 focus:bg-white rounded focus:outline-none resize-none"
                      />
                    </td>

                    {/* Unit */}
                    <td className="py-2.5 px-3 pt-3.5">
                      <select
                        value={item.unit || 'unidad'}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="w-full text-xs font-semibold px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500"
                      >
                        <option value="unidad">u</option>
                        <option value="m²">m²</option>
                        <option value="m lineal">ml</option>
                        <option value="litro">lt</option>
                        <option value="hora">hs</option>
                        <option value="bolsa">bolsa</option>
                        <option value="kg">kg</option>
                        <option value="global">gl</option>
                      </select>
                    </td>

                    {/* Quantity */}
                    <td className="py-2.5 px-3 pt-3.5">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.quantity !== undefined ? item.quantity : 1}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="w-full text-xs font-bold text-right px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                      />
                    </td>

                    {/* Unit Price */}
                    <td className="py-2.5 px-3 pt-3.5">
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice !== undefined ? item.unitPrice : 0}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        className="w-full text-xs font-bold text-right px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono text-brand-700"
                      />
                    </td>

                    {/* Line Discount */}
                    <td className="py-2.5 px-3 pt-3.5">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        max="100"
                        value={item.itemDiscount !== undefined ? item.itemDiscount : 0}
                        onChange={(e) => handleItemChange(index, 'itemDiscount', e.target.value)}
                        className="w-full text-xs text-right px-2 py-1 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                      />
                    </td>

                    {/* Subtotal */}
                    <td className="py-2.5 px-3 pt-4 text-right font-mono font-bold text-xs text-slate-900 whitespace-nowrap">
                      {quote.currencySymbol} {formatMoney(lineSubtotal)}
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3 pt-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleMoveItem(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          title="Subir"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleMoveItem(index, 'down')}
                          disabled={index === quote.items.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20"
                          title="Bajar"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicateItem(index)}
                          className="p-1 text-slate-400 hover:text-emerald-600"
                          title="Duplicar"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(index)}
                          className="p-1 text-slate-400 hover:text-rose-600"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <button
            onClick={handleAddBlankItem}
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 py-1 px-2 rounded hover:bg-brand-50"
          >
            <Plus className="w-3.5 h-3.5" /> Añadir fila
          </button>
          <span>{quote.items?.length || 0} ítems</span>
        </div>

      </div>

      {/* CHECKS & TOTALS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Checks Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-brand-600" />
              Opciones de Liquidación e Impresión
            </h3>
          </div>

          <div className="space-y-2.5">
            
            {/* Check: IVA */}
            <div className={`p-2.5 rounded-xl border ${
              quote.checks?.applyIva ? 'bg-brand-50/40 border-brand-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={quote.checks?.applyIva || false}
                    onChange={(e) => setQuote({
                      ...quote,
                      checks: { ...quote.checks, applyIva: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-brand-600"
                  />
                  <span>Aplicar IVA</span>
                </label>
                
                {quote.checks?.applyIva && (
                  <select
                    value={quote.checks?.ivaRate !== undefined ? quote.checks.ivaRate : 21}
                    onChange={(e) => setQuote({
                      ...quote,
                      checks: { ...quote.checks, ivaRate: parseFloat(e.target.value) || 0 }
                    })}
                    className="text-xs font-bold bg-white border border-slate-300 rounded px-2 py-0.5"
                  >
                    <option value="21">21%</option>
                    <option value="10.5">10.5%</option>
                    <option value="27">27%</option>
                  </select>
                )}
              </div>
            </div>

            {/* Check: Descuento Global */}
            <div className={`p-2.5 rounded-xl border ${
              quote.checks?.applyDiscount ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={quote.checks?.applyDiscount || false}
                    onChange={(e) => setQuote({
                      ...quote,
                      checks: { ...quote.checks, applyDiscount: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>Descuento Global</span>
                </label>

                {quote.checks?.applyDiscount && (
                  <div className="flex items-center gap-2">
                    <select
                      value={quote.checks?.discountType || 'percent'}
                      onChange={(e) => setQuote({
                        ...quote,
                        checks: { ...quote.checks, discountType: e.target.value }
                      })}
                      className="text-xs bg-white border border-slate-300 rounded px-2 py-0.5"
                    >
                      <option value="percent">%</option>
                      <option value="fixed">{quote.currencySymbol}</option>
                    </select>

                    <div className="w-24">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={quote.checks?.discountValue !== undefined ? quote.checks.discountValue : 0}
                        onChange={(e) => setQuote({
                          ...quote,
                          checks: { ...quote.checks, discountValue: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full text-xs font-bold text-right px-2 py-0.5 bg-white border border-slate-300 rounded font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Check: Flete / Logística */}
            <div className={`p-2.5 rounded-xl border ${
              quote.checks?.applyShipping ? 'bg-sky-50/40 border-sky-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={quote.checks?.applyShipping || false}
                    onChange={(e) => setQuote({
                      ...quote,
                      checks: { ...quote.checks, applyShipping: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-sky-600"
                  />
                  <span>Flete / Entrega en Obra</span>
                </label>

                {quote.checks?.applyShipping && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Zona..."
                      value={quote.checks?.shippingNote || ''}
                      onChange={(e) => setQuote({
                        ...quote,
                        checks: { ...quote.checks, shippingNote: e.target.value }
                      })}
                      className="text-xs px-2 py-0.5 bg-white border border-slate-300 rounded w-32"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={quote.checks?.shippingAmount !== undefined ? quote.checks.shippingAmount : 0}
                      onChange={(e) => setQuote({
                        ...quote,
                        checks: { ...quote.checks, shippingAmount: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-24 text-xs font-bold text-right px-2 py-0.5 bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Check: Mano de Obra extra */}
            <div className={`p-2.5 rounded-xl border ${
              quote.checks?.applyLaborExtra ? 'bg-indigo-50/40 border-indigo-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={quote.checks?.applyLaborExtra || false}
                    onChange={(e) => setQuote({
                      ...quote,
                      checks: { ...quote.checks, applyLaborExtra: e.target.checked }
                    })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>Mano de Obra adicional / Montaje</span>
                </label>

                {quote.checks?.applyLaborExtra && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Detalle..."
                      value={quote.checks?.laborExtraNote || ''}
                      onChange={(e) => setQuote({
                        ...quote,
                        checks: { ...quote.checks, laborExtraNote: e.target.value }
                      })}
                      className="text-xs px-2 py-0.5 bg-white border border-slate-300 rounded w-32"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={quote.checks?.laborExtraAmount !== undefined ? quote.checks.laborExtraAmount : 0}
                      onChange={(e) => setQuote({
                        ...quote,
                        checks: { ...quote.checks, laborExtraAmount: parseFloat(e.target.value) || 0 }
                      })}
                      className="w-24 text-xs font-bold text-right px-2 py-0.5 bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Check: Términos y Condiciones (Default: True) */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={quote.checks?.includeTerms !== false}
                  onChange={(e) => setQuote({
                    ...quote,
                    checks: { ...quote.checks, includeTerms: e.target.checked }
                  })}
                  className="w-4 h-4 rounded text-brand-600"
                />
                <span>Incluir Términos y Condiciones en la hoja de impresión</span>
              </label>
            </div>

            {/* Check: Espacio de Firmas (Default: True) */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={quote.checks?.includeSignatures !== false}
                  onChange={(e) => setQuote({
                    ...quote,
                    checks: { ...quote.checks, includeSignatures: e.target.checked }
                  })}
                  className="w-4 h-4 rounded text-brand-600"
                />
                <span>Incluir Espacio de Firmas en la hoja de impresión</span>
              </label>
            </div>

            {/* Condición de Pago */}
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Forma de Pago / Anticipo
              </label>
              <input
                type="text"
                placeholder="50% anticipo al iniciar y 50% contra entrega..."
                value={quote.checks?.paymentCondition || ''}
                onChange={(e) => setQuote({
                  ...quote,
                  checks: { ...quote.checks, paymentCondition: e.target.value }
                })}
                className="w-full text-xs px-2.5 py-1 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

          </div>
        </div>

        {/* Totals Breakdown Card (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-5 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-slate-800 pb-2 flex items-center justify-between">
              <h3 className="text-xs font-bold tracking-tight text-white uppercase flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                Resumen
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                {quote.currency || 'ARS'}
              </span>
            </div>

            <div className="divide-y divide-slate-800 text-xs mt-2 space-y-2">
              
              <div className="flex justify-between items-center pt-1.5 text-slate-300">
                <span>Subtotal Bruto:</span>
                <span className="font-mono font-semibold text-white">
                  {quote.currencySymbol} {formatMoney(calculatedTotals.subtotal)}
                </span>
              </div>

              {quote.checks?.applyDiscount && calculatedTotals.discountAmount > 0 && (
                <div className="flex justify-between items-center pt-1.5 text-emerald-400">
                  <span>Descuento:</span>
                  <span className="font-mono font-semibold">
                    - {quote.currencySymbol} {formatMoney(calculatedTotals.discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center pt-1.5 text-slate-300">
                <span>Subtotal Neto:</span>
                <span className="font-mono font-semibold text-white">
                  {quote.currencySymbol} {formatMoney(calculatedTotals.netSubtotal)}
                </span>
              </div>

              {quote.checks?.applyIva && (
                <div className="flex justify-between items-center pt-1.5 text-slate-300">
                  <span>IVA ({quote.checks.ivaRate}%):</span>
                  <span className="font-mono font-semibold text-white">
                    + {quote.currencySymbol} {formatMoney(calculatedTotals.ivaAmount)}
                  </span>
                </div>
              )}

              {quote.checks?.applyShipping && calculatedTotals.shippingAmount > 0 && (
                <div className="flex justify-between items-center pt-1.5 text-slate-300">
                  <span>Flete:</span>
                  <span className="font-mono font-semibold text-white">
                    + {quote.currencySymbol} {formatMoney(calculatedTotals.shippingAmount)}
                  </span>
                </div>
              )}

              {quote.checks?.applyLaborExtra && calculatedTotals.laborExtraAmount > 0 && (
                <div className="flex justify-between items-center pt-1.5 text-slate-300">
                  <span>Mano de Obra extra:</span>
                  <span className="font-mono font-semibold text-white">
                    + {quote.currencySymbol} {formatMoney(calculatedTotals.laborExtraAmount)}
                  </span>
                </div>
              )}

            </div>
          </div>

          {/* Grand Total Box */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
              TOTAL
            </span>
            <div className="text-3xl font-black text-emerald-400 font-mono tracking-tight">
              {quote.currencySymbol} {formatMoney(calculatedTotals.grandTotal)}
            </div>
          </div>

        </div>

      </div>

      {/* Terms & Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">
            Términos y Condiciones
          </label>
          <textarea
            rows="4"
            value={quote.terms || ''}
            onChange={(e) => setQuote({ ...quote, terms: e.target.value })}
            placeholder="Validez, forma de pago, plazos..."
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 leading-relaxed font-sans"
          />
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">
            Observaciones Adicionales
          </label>
          <textarea
            rows="4"
            value={quote.notes || ''}
            onChange={(e) => setQuote({ ...quote, notes: e.target.value })}
            placeholder="Comentarios u horarios de obra..."
            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 leading-relaxed"
          />
        </div>

      </div>

      {/* CATALOG SELECTION MODAL */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-sm">Seleccionar del Tarifario</h3>
              <button
                onClick={() => setIsCatalogModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-slate-100 bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar ítem..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
              {filteredCatalog.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No se encontraron ítems.
                </div>
              ) : (
                filteredCatalog.map(item => (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCatalogItem(item)}
                    className="p-2.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-800">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {item.category} • por {item.unit}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-900">
                        {quote.currencySymbol} {formatMoney(item.price)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setIsCatalogModalOpen(false)}
                className="px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
