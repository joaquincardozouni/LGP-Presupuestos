import React from 'react';
import { Printer, ArrowLeft } from 'lucide-react';

export default function PrintQuoteView({ quote, settings = {}, onBackToEdit }) {
  if (!quote) return null;

  const currencySymbol = quote.currencySymbol || settings.currencySymbol || '$';
  const totals = quote.totals || {};
  const checks = quote.checks || {};
  const client = quote.client || {};

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Floating Control Bar (Hidden when printing!) */}
      <div className="no-print bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToEdit}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Editar</span>
          </button>

          <span className="font-mono font-bold text-xs text-brand-400">
            {quote.number || 'Sin número'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl shadow transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar como PDF</span>
          </button>
        </div>
      </div>

      {/* A4 Printable Sheet Container */}
      <div className="print-container bg-white rounded-2xl shadow-xl border border-slate-200 p-8 sm:p-12 max-w-4xl mx-auto text-slate-800 font-sans">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-2 border-slate-800 pb-5">
          
          {/* LGP Brand Info */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl tracking-wider">
                LGP
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                  {settings.companyName || 'LGP'}
                </h1>
                <p className="text-xs font-bold text-brand-700 tracking-wider uppercase mt-1">
                  {settings.companySubtitle || 'Construcciones & Herrería'}
                </p>
              </div>
            </div>

            <div className="mt-3 space-y-0.5 text-xs text-slate-600">
              {settings.address && <p>{settings.address}</p>}
              {settings.phone && <p>Tel: {settings.phone}</p>}
              {settings.email && <p>Email: {settings.email}</p>}
              {settings.taxId && <p>{settings.taxId}</p>}
            </div>
          </div>

          {/* Quote Meta Box (Without showing 'Estado'!) */}
          <div className="sm:text-right bg-slate-50 p-4 rounded-xl border border-slate-200 min-w-[220px]">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">
              PRESUPUESTO
            </span>
            <div className="text-xl font-bold font-mono text-slate-900 mt-0.5">
              {quote.number || 'LGP-PRESUPUESTO'}
            </div>

            <div className="mt-2.5 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between sm:justify-end gap-3">
                <span className="text-slate-500">Fecha:</span>
                <span className="font-semibold text-slate-900">{quote.date || '-'}</span>
              </div>
              <div className="flex justify-between sm:justify-end gap-3">
                <span className="text-slate-500">Validez:</span>
                <span className="font-semibold text-slate-900">{quote.validUntil || '-'}</span>
              </div>
            </div>
          </div>

        </div>

        {/* CLIENT DETAILS SECTION */}
        <div className="mt-5 bg-slate-50 rounded-xl p-4 border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            DATOS DEL CLIENTE / OBRA
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
            <div>
              <span className="text-slate-500">Cliente: </span>
              <strong className="text-slate-900">{client.name || '-'}</strong>
            </div>
            {client.company && (
              <div>
                <span className="text-slate-500">Obra / Referencia: </span>
                <strong className="text-slate-900">{client.company}</strong>
              </div>
            )}
            {client.taxId && (
              <div>
                <span className="text-slate-500">CUIT / DNI: </span>
                <span className="font-mono text-slate-800">{client.taxId}</span>
              </div>
            )}
            {client.phone && (
              <div>
                <span className="text-slate-500">Teléfono: </span>
                <span className="text-slate-800">{client.phone}</span>
              </div>
            )}
            {client.email && (
              <div>
                <span className="text-slate-500">Email: </span>
                <span className="text-slate-800">{client.email}</span>
              </div>
            )}
            {client.address && (
              <div>
                <span className="text-slate-500">Ubicación: </span>
                <span className="text-slate-800">{client.address}</span>
              </div>
            )}
          </div>
        </div>

        {/* ITEMS TABLE */}
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 w-8 text-center">#</th>
                <th className="py-2.5 px-3">Concepto / Detalle de Trabajos</th>
                <th className="py-2.5 px-3 w-16 text-center">Unidad</th>
                <th className="py-2.5 px-3 w-16 text-right">Cant.</th>
                <th className="py-2.5 px-3 w-28 text-right">Precio Unit.</th>
                <th className="py-2.5 px-3 w-28 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(quote.items || []).map((item, index) => {
                const q = parseFloat(item.quantity) || 0;
                const p = parseFloat(item.unitPrice) || 0;
                const d = parseFloat(item.itemDiscount) || 0;
                const sub = (q * p) * (1 - (d / 100));

                return (
                  <tr key={item.id || index} className="align-top">
                    <td className="py-2 px-3 text-center text-slate-400 font-mono font-semibold">
                      {index + 1}
                    </td>
                    <td className="py-2 px-3">
                      <div className="font-bold text-slate-900 text-xs">{item.title}</div>
                      {item.description && (
                        <div className="text-[11px] text-slate-600 mt-0.5 whitespace-pre-line leading-relaxed">
                          {item.description}
                        </div>
                      )}
                      {d > 0 && (
                        <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                          Descuento: {d}%
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 text-center uppercase font-semibold text-slate-600">
                      {item.unit || 'u'}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                      {q}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-800">
                      {currencySymbol} {formatMoney(p)}
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                      {currencySymbol} {formatMoney(sub)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* TOTALS & CONDITIONS BREAKDOWN */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start">
          
          {/* Terms & Payment Conditions (7 cols) */}
          <div className="sm:col-span-7 space-y-3">
            
            {checks.paymentCondition && (
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 block mb-0.5">Forma de Pago:</span>
                <span className="text-slate-700">{checks.paymentCondition}</span>
              </div>
            )}

            {/* Optional Términos y Condiciones */}
            {checks.includeTerms !== false && quote.terms && (
              <div className="text-xs text-slate-600">
                <span className="font-bold text-slate-800 block mb-1 uppercase tracking-wider text-[10px]">
                  Términos y Condiciones:
                </span>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 whitespace-pre-line leading-relaxed text-[11px] text-slate-700">
                  {quote.terms}
                </div>
              </div>
            )}

            {quote.notes && (
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-700 block mb-0.5">Observaciones:</span>
                <p className="whitespace-pre-line text-[11px]">{quote.notes}</p>
              </div>
            )}

          </div>

          {/* Financial Totals Table (5 cols) */}
          <div className="sm:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold">{currencySymbol} {formatMoney(totals.subtotal)}</span>
            </div>

            {checks.applyDiscount && totals.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Descuento ({checks.discountType === 'percent' ? `${checks.discountValue}%` : 'Fijo'}):</span>
                <span className="font-mono">- {currencySymbol} {formatMoney(totals.discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-700 font-semibold pt-1 border-t border-slate-200">
              <span>Subtotal Neto:</span>
              <span className="font-mono">{currencySymbol} {formatMoney(totals.netSubtotal)}</span>
            </div>

            {checks.applyIva && (
              <div className="flex justify-between text-slate-600">
                <span>IVA ({checks.ivaRate}%):</span>
                <span className="font-mono font-semibold">+ {currencySymbol} {formatMoney(totals.ivaAmount)}</span>
              </div>
            )}

            {checks.applyOtherTax && totals.otherTaxAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>{checks.otherTaxName || 'Otros Impuestos'} ({checks.otherTaxRate}%):</span>
                <span className="font-mono font-semibold">+ {currencySymbol} {formatMoney(totals.otherTaxAmount)}</span>
              </div>
            )}

            {checks.applyShipping && totals.shippingAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Flete / Logística:</span>
                <span className="font-mono font-semibold">+ {currencySymbol} {formatMoney(totals.shippingAmount)}</span>
              </div>
            )}

            {checks.applyLaborExtra && totals.laborExtraAmount > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Mano de Obra extra:</span>
                <span className="font-mono font-semibold">+ {currencySymbol} {formatMoney(totals.laborExtraAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t-2 border-slate-300">
              <span>TOTAL:</span>
              <span className="font-mono text-base text-brand-800">
                {currencySymbol} {formatMoney(totals.grandTotal)}
              </span>
            </div>
          </div>

        </div>

        {/* Optional SIGNATURE AREA (Only Firma, no aclaración ni DNI) */}
        {checks.includeSignatures !== false && (
          <div className="mt-12 pt-6 border-t border-slate-200 grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="border-b border-slate-400 w-44 mx-auto mb-2" />
              <p className="font-bold text-slate-800">Firma LGP</p>
            </div>

            <div>
              <div className="border-b border-slate-400 w-44 mx-auto mb-2" />
              <p className="font-bold text-slate-800">Firma del Cliente</p>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
