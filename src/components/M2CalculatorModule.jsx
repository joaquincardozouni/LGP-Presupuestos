import React, { useState } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Layers, 
  Send, 
  Check, 
  Percent, 
  Maximize2
} from 'lucide-react';

export default function M2CalculatorModule({ 
  itemsCatalog = [], 
  settings = {}, 
  onAddCalculatedItemToQuote 
}) {
  const currencySymbol = settings.currencySymbol || '$';

  // Surface pieces list
  const [pieces, setPieces] = useState([
    { id: 'p-1', name: 'Paño / Superficie 1', length: 5.0, width: 4.0, count: 1 }
  ]);

  // Waste / Margin percentage
  const [wastePercent, setWastePercent] = useState(10);

  // Material / Service selection
  const [selectedItemId, setSelectedItemId] = useState('');
  const [customItemTitle, setCustomItemTitle] = useState('Revestimiento / Obra por m²');
  const [unitPrice, setUnitPrice] = useState(18500);

  // Filter catalog items that are in m²
  const m2CatalogItems = itemsCatalog.filter(i => (i.unit || '').toLowerCase().includes('m²'));

  // Calculations
  const pieceCalculations = pieces.map(p => {
    const l = parseFloat(p.length) || 0;
    const w = parseFloat(p.width) || 0;
    const c = parseFloat(p.count) || 1;
    const area = l * w * c;
    return { ...p, area };
  });

  const baseTotalM2 = pieceCalculations.reduce((sum, p) => sum + p.area, 0);
  const wasteM2 = (baseTotalM2 * (parseFloat(wastePercent) || 0)) / 100;
  const finalTotalM2 = baseTotalM2 + wasteM2;
  const totalCost = finalTotalM2 * (parseFloat(unitPrice) || 0);

  // Piece handlers
  const handleAddPiece = () => {
    const newPiece = {
      id: `p-${Date.now()}`,
      name: `Paño / Superficie ${pieces.length + 1}`,
      length: 3.0,
      width: 2.5,
      count: 1
    };
    setPieces([...pieces, newPiece]);
  };

  const handleUpdatePiece = (index, field, value) => {
    const updated = [...pieces];
    updated[index] = { ...updated[index], [field]: value };
    setPieces(updated);
  };

  const handleDeletePiece = (index) => {
    if (pieces.length <= 1) {
      alert('Debe conservar al menos un paño para el cálculo.');
      return;
    }
    setPieces(pieces.filter((_, i) => i !== index));
  };

  const handleSelectCatalogItem = (e) => {
    const itemId = e.target.value;
    setSelectedItemId(itemId);
    if (itemId) {
      const found = itemsCatalog.find(i => i.id === itemId);
      if (found) {
        setCustomItemTitle(found.name);
        setUnitPrice(found.price || 0);
      }
    }
  };

  const handleSendToQuote = () => {
    if (finalTotalM2 <= 0) {
      alert('El área total calculada debe ser mayor a cero.');
      return;
    }

    // Build nice detailed breakdown
    const piecesDetail = pieceCalculations
      .map(p => `${p.name}: ${p.length}m x ${p.width}m (${p.count > 1 ? `${p.count} paños = ` : ''}${p.area.toFixed(2)} m²)`)
      .join('; ');

    const description = `Área neta: ${baseTotalM2.toFixed(2)} m² + ${wastePercent}% desperdicio (${wasteM2.toFixed(2)} m²) = TOTAL: ${finalTotalM2.toFixed(2)} m². Detalle: ${piecesDetail}.`;

    const quoteItem = {
      id: `qi-calc-${Date.now()}`,
      itemId: selectedItemId || null,
      title: customItemTitle || 'Cálculo por metro cuadrado',
      description: description,
      unit: 'm²',
      quantity: Number(finalTotalM2.toFixed(2)),
      unitPrice: Number(unitPrice) || 0,
      itemDiscount: 0,
      subtotal: Number(totalCost.toFixed(2))
    };

    onAddCalculatedItemToQuote(quoteItem);
  };

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cálculo de Superficie por Metro Cuadrado (m²)</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Cómputo de paños, adición de margen de recortes e inserción directa en el presupuesto.
          </p>
        </div>

        <button
          onClick={handleSendToQuote}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Insertar en Presupuesto Activo</span>
        </button>
      </div>

      {/* Main Grid: Pieces & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Pieces List (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Maximize2 className="w-4 h-4 text-brand-600" />
              Medidas de Paños o Ambientes
            </h2>
            <button
              onClick={handleAddPiece}
              className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Paño</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {pieces.map((piece, index) => {
              const calc = pieceCalculations[index];
              return (
                <div 
                  key={piece.id} 
                  className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={piece.name}
                      onChange={(e) => handleUpdatePiece(index, 'name', e.target.value)}
                      placeholder="Nombre del paño..."
                      className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="w-20">
                      <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Largo (m)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={piece.length}
                        onChange={(e) => handleUpdatePiece(index, 'length', e.target.value)}
                        className="w-full text-xs font-mono font-bold text-right px-2 py-1 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <span className="text-slate-400 text-xs font-bold mt-3">×</span>

                    <div className="w-20">
                      <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Ancho/Alto</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={piece.width}
                        onChange={(e) => handleUpdatePiece(index, 'width', e.target.value)}
                        className="w-full text-xs font-mono font-bold text-right px-2 py-1 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <div className="w-14">
                      <label className="block text-[10px] text-slate-400 font-semibold mb-0.5">Cant.</label>
                      <input
                        type="number"
                        min="1"
                        value={piece.count}
                        onChange={(e) => handleUpdatePiece(index, 'count', e.target.value)}
                        className="w-full text-xs font-mono font-bold text-center px-1 py-1 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-500"
                      />
                    </div>

                    <div className="w-24 text-right pl-2 mt-3 font-mono font-bold text-xs text-brand-700">
                      {calc.area.toFixed(2)} m²
                    </div>

                    <button
                      onClick={() => handleDeletePiece(index)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors mt-3"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-700 font-medium">
            <span>Suma de superficie neta:</span>
            <span className="font-mono font-bold text-sm text-slate-900">{baseTotalM2.toFixed(2)} m²</span>
          </div>
        </div>

        {/* Waste & Pricing Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Card: Desperdicio & Margen */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Margen de Desperdicio / Recortes
            </h3>

            <div className="flex items-center gap-1.5">
              {[0, 5, 10, 15, 20].map(pct => (
                <button
                  key={pct}
                  onClick={() => setWastePercent(pct)}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg border transition-all ${
                    wastePercent === pct
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500">Porcentaje manual:</span>
              <div className="flex items-center gap-1 w-20">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={wastePercent}
                  onChange={(e) => setWastePercent(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold text-right px-2 py-1 bg-slate-50 border border-slate-200 rounded font-mono"
                />
                <span className="font-bold text-slate-500">%</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Área Neta:</span>
                <span className="font-mono font-semibold">{baseTotalM2.toFixed(2)} m²</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Desperdicio (+{wastePercent}%):</span>
                <span className="font-mono font-semibold">+{wasteM2.toFixed(2)} m²</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Superficie Final:</span>
                <span className="font-mono text-sm text-brand-700">{finalTotalM2.toFixed(2)} m²</span>
              </div>
            </div>
          </div>

          {/* Card: Tarifa y Precio Unitario */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Precio Unitario por m²
            </h3>

            {m2CatalogItems.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Vincular ítem del tarifario:
                </label>
                <select
                  value={selectedItemId}
                  onChange={handleSelectCatalogItem}
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="">-- Precio manual --</option>
                  {m2CatalogItems.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({currencySymbol} {formatMoney(item.price)}/m²)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Concepto / Título del ítem
              </label>
              <input
                type="text"
                value={customItemTitle}
                onChange={(e) => setCustomItemTitle(e.target.value)}
                className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Precio por m² ({currencySymbol})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                  {currencySymbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
                />
              </div>
            </div>

            {/* Total Cost Highlight */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Subtotal Estimado
              </span>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
                {currencySymbol} {formatMoney(totalCost)}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {finalTotalM2.toFixed(2)} m² a {currencySymbol} {formatMoney(unitPrice)}/m²
              </p>
            </div>

            <button
              onClick={handleSendToQuote}
              className="w-full py-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Insertar en Presupuesto Activo</span>
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}
