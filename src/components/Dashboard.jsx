import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Eye, 
  TrendingUp, 
  Receipt,
  ArrowUpRight
} from 'lucide-react';

export default function Dashboard({ 
  quotes = [], 
  items = [], 
  settings = {}, 
  onEditQuote, 
  onViewQuote, 
  setActiveTab 
}) {
  const currencySymbol = settings.currencySymbol || '$';

  // Metrics
  const totalQuotesCount = quotes.length;
  const approvedQuotes = quotes.filter(q => q.status === 'Aprobado');
  const pendingQuotes = quotes.filter(q => q.status === 'Pendiente');

  const totalAmountCotizado = quotes.reduce((sum, q) => sum + (q.totals?.grandTotal || 0), 0);
  const totalAmountAprobado = approvedQuotes.reduce((sum, q) => sum + (q.totals?.grandTotal || 0), 0);

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Aprobado':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">Aprobado</span>;
      case 'Pendiente':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">Pendiente</span>;
      case 'Facturado':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">Facturado</span>;
      case 'Rechazado':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">Rechazado</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Borrador</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Formal Header Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 sm:p-7 text-white border border-slate-800">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Sistema de Presupuestos y Tarifas
        </h1>
        <p className="mt-1.5 text-slate-300 text-sm max-w-2xl font-normal leading-relaxed">
          Control y emisión de cotizaciones, tarifas de obra y herrería, y cómputo de superficies de LGP.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Cotizado</span>
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {currencySymbol} {formatMoney(totalAmountCotizado)}
            </div>
            <p className="text-xs text-slate-500 mt-1">{totalQuotesCount} presupuestos registrados</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Aprobados</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-700 tracking-tight font-mono">
              {currencySymbol} {formatMoney(totalAmountAprobado)}
            </div>
            <p className="text-xs text-emerald-600 mt-1">{approvedQuotes.length} presupuestos confirmados</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pendientes</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-600 tracking-tight font-mono">
              {pendingQuotes.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Presupuestos en seguimiento</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ítems en Tarifario</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">
              {items.length}
            </div>
            <p className="text-xs text-slate-500 mt-1">Materiales, mano de obra y herrería</p>
          </div>
        </div>

      </div>

      {/* Recent Quotes Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-brand-600" />
              Últimos Presupuestos
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('history')}
            className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
          >
            Ver historial completo <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {quotes.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            No hay presupuestos registrados en el sistema.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 font-semibold">Nº Presupuesto</th>
                  <th className="py-3 px-4 font-semibold">Cliente</th>
                  <th className="py-3 px-4 font-semibold">Fecha</th>
                  <th className="py-3 px-4 font-semibold">Ítems</th>
                  <th className="py-3 px-4 font-semibold">Estado</th>
                  <th className="py-3 px-4 font-semibold text-right">Total</th>
                  <th className="py-3 px-4 font-semibold text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotes.slice(0, 5).map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-brand-700 text-xs">
                      {q.number || 'Sin número'}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      <div>{q.client?.name || 'Sin nombre'}</div>
                      {q.client?.company && (
                        <div className="text-xs text-slate-400">{q.client.company}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {q.date || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {q.items?.length || 0} ítems
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(q.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                      {currencySymbol} {formatMoney(q.totals?.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onViewQuote(q)}
                          title="Ver / Imprimir"
                          className="p-1.5 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditQuote(q)}
                          className="px-2.5 py-1 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
                        >
                          Editar
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
  );
}
