import React, { useState, useMemo } from 'react';
import { 
  History, 
  Search, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2, 
  Download, 
  RotateCcw,
  Archive,
  FileText
} from 'lucide-react';

export default function QuoteHistory({ 
  quotes = [], 
  backups = [],
  onViewQuote, 
  onEditQuote, 
  onDuplicateQuote, 
  onDeleteQuote, 
  onUpdateStatus, 
  onRestoreWipedBackup,
  onDeleteWipedBackup,
  settings = {} 
}) {
  const currencySymbol = settings.currencySymbol || '$';

  // Sub-tabs: 'quotes' or 'backups'
  const [activeSubTab, setActiveSubTab] = useState('quotes');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter quotes
  const filteredQuotes = useMemo(() => {
    return quotes.filter(q => {
      const clientName = q.client?.name || '';
      const clientCompany = q.client?.company || '';
      const quoteNumber = q.number || '';
      const notes = q.notes || '';

      const matchSearch = 
        clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clientCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notes.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === 'ALL' || q.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [quotes, searchTerm, statusFilter]);

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const statusOptions = ['Borrador', 'Pendiente', 'Aprobado', 'Facturado', 'Rechazado'];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Aprobado':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">Aprobado</span>;
      case 'Pendiente':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">Pendiente</span>;
      case 'Facturado':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Facturado</span>;
      case 'Rechazado':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">Rechazado</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">Borrador</span>;
    }
  };

  // Export quotes to CSV
  const exportQuotesToCSV = () => {
    const headers = ['Nro Presupuesto', 'Fecha', 'Cliente', 'Empresa', 'Estado', 'Subtotal', 'IVA', 'Total'];
    const rows = quotes.map(q => [
      `"${q.number || ''}"`,
      `"${q.date || ''}"`,
      `"${q.client?.name || ''}"`,
      `"${q.client?.company || ''}"`,
      `"${q.status || ''}"`,
      q.totals?.subtotal || 0,
      q.totals?.ivaAmount || 0,
      q.totals?.grandTotal || 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LGP_Historial_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header with Sub-tabs */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Historial y Respaldos</h1>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => setActiveSubTab('quotes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeSubTab === 'quotes'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Presupuestos Guardados ({quotes.length})
            </button>
            <button
              onClick={() => setActiveSubTab('backups')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'backups'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Respaldos al Limpiar ({backups.length})</span>
            </button>
          </div>
        </div>

        {activeSubTab === 'quotes' && (
          <button
            onClick={exportQuotesToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        )}
      </div>

      {/* VIEW 1: PRESUPESTOS GUARDADOS */}
      {activeSubTab === 'quotes' && (
        <div className="space-y-4">
          
          {/* Filter & Search Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por cliente, obra o número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  statusFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos
              </button>
              {statusOptions.map(st => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-brand-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {filteredQuotes.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay presupuestos en esta vista.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-semibold w-36">Nº Presupuesto</th>
                      <th className="py-3 px-4 font-semibold">Cliente / Obra</th>
                      <th className="py-3 px-4 font-semibold w-24">Fecha</th>
                      <th className="py-3 px-4 font-semibold w-32">Estado</th>
                      <th className="py-3 px-4 font-semibold text-right w-36">Total ({currencySymbol})</th>
                      <th className="py-3 px-4 font-semibold text-center w-36">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredQuotes.map((q) => (
                      <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                        
                        <td className="py-3 px-4 font-mono font-bold text-xs text-slate-900">
                          {q.number || 'Sin número'}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 text-xs">{q.client?.name || 'Sin nombre'}</div>
                          {q.client?.company && (
                            <div className="text-[11px] text-slate-400">{q.client.company}</div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-xs text-slate-500">
                          {q.date || '-'}
                        </td>

                        <td className="py-3 px-4">
                          <select
                            value={q.status || 'Pendiente'}
                            onChange={(e) => onUpdateStatus(q.id, e.target.value)}
                            className="text-xs font-semibold px-2 py-0.5 rounded border border-slate-200 bg-white cursor-pointer"
                          >
                            {statusOptions.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 text-xs">
                          {currencySymbol} {formatMoney(q.totals?.grandTotal)}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => onViewQuote(q)}
                              title="Ver / Imprimir"
                              className="p-1.5 text-slate-500 hover:text-brand-600 rounded transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditQuote(q)}
                              title="Editar"
                              className="p-1.5 text-slate-500 hover:text-indigo-600 rounded transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDuplicateQuote(q)}
                              title="Duplicar"
                              className="p-1.5 text-slate-500 hover:text-emerald-600 rounded transition-colors"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`¿Eliminar el presupuesto "${q.number || q.client?.name}"?`)) {
                                  onDeleteQuote(q.id);
                                }
                              }}
                              title="Eliminar"
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: RESPALDOS AUTOMATICOS (AL LIMPIAR) */}
      {activeSubTab === 'backups' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-900">Respaldos de Presupuestos Limpiados</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Aquí se guardan automáticamente las copias de seguridad cada vez que pulsas "Nuevo / Limpiar" en el presupuesto.
            </p>
          </div>

          {backups.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              No hay respaldos automáticos por el momento.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Fecha de Respaldo</th>
                    <th className="py-3 px-4 font-semibold">Cliente / Obra</th>
                    <th className="py-3 px-4 font-semibold">Nº Ref.</th>
                    <th className="py-3 px-4 font-semibold text-center">Ítems</th>
                    <th className="py-3 px-4 font-semibold text-right">Monto Estimado</th>
                    <th className="py-3 px-4 font-semibold text-center w-40">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {backups.map((b) => (
                    <tr key={b.backupId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 text-xs font-mono text-slate-500">
                        {b.wipedAt ? new Date(b.wipedAt).toLocaleString('es-AR') : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-bold text-slate-900">{b.client?.name || '(Sin nombre)'}</div>
                        {b.client?.company && (
                          <div className="text-[11px] text-slate-400">{b.client.company}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">
                        {b.number || '-'}
                      </td>
                      <td className="py-3 px-4 text-center text-xs">
                        {b.items?.length || 0}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-xs text-slate-900">
                        {currencySymbol} {formatMoney(b.totals?.grandTotal)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onRestoreWipedBackup(b)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
                            title="Cargar de vuelta en el editor de presupuestos"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restaurar</span>
                          </button>
                          <button
                            onClick={() => onDeleteWipedBackup(b.backupId)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Eliminar este respaldo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
