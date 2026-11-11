import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Building2, 
  Save, 
  Download, 
  Upload, 
  Check, 
  Calendar,
  RefreshCw,
  CloudDownload,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function SettingsModule({ settings = {}, onSaveSettings, onRestoreBackup }) {
  const [formData, setFormData] = useState({
    companyName: settings.companyName || 'LGP',
    companySubtitle: settings.companySubtitle || 'Construcciones & Herrería',
    taxId: settings.taxId || '',
    phone: settings.phone || '+54 9 11 3445-5720',
    email: settings.email || 'contacto@lgp.com.ar',
    address: settings.address || 'Ituzaingó, Buenos Aires',
    website: settings.website || '',
    currency: settings.currency || 'ARS',
    currencySymbol: settings.currencySymbol || '$',
    defaultIva: settings.defaultIva !== undefined ? settings.defaultIva : 21,
    defaultValidityDays: settings.defaultValidityDays || 15,
    quotePrefix: settings.quotePrefix || 'LGP-',
    nextQuoteNumber: settings.nextQuoteNumber || 1002,
    defaultTerms: settings.defaultTerms || ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState('');

  // Update System State (Manual Flow: Check -> Download -> Install)
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [updateStep, setUpdateStep] = useState('idle'); // 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'up-to-date' | 'error'
  const [updateMessage, setUpdateMessage] = useState('');
  const [newVersion, setNewVersion] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Check if running inside Electron desktop app
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;

  useEffect(() => {
    if (isElectron && window.electronAPI.getAppVersion) {
      window.electronAPI.getAppVersion().then(v => {
        if (v) setAppVersion(v);
      }).catch(() => {});

      const unsubscribe = window.electronAPI.onUpdateStatus((data) => {
        if (data.status === 'checking') {
          setUpdateStep('checking');
          setUpdateMessage(data.message || 'Buscando actualizaciones...');
        } else if (data.status === 'available') {
          setUpdateStep('available');
          setNewVersion(data.version || '');
          setUpdateMessage(`¡Nueva versión v${data.version || ''} encontrada!`);
        } else if (data.status === 'not-available') {
          setUpdateStep('up-to-date');
          setUpdateMessage('El programa ya se encuentra en la versión más reciente.');
        } else if (data.status === 'downloading') {
          setUpdateStep('downloading');
          setDownloadProgress(data.percent || 0);
          setUpdateMessage(`Descargando actualización: ${data.percent || 0}%`);
        } else if (data.status === 'downloaded') {
          setUpdateStep('downloaded');
          setUpdateMessage(`Versión v${data.version || ''} descargada con éxito.`);
        } else if (data.status === 'error') {
          setUpdateStep('error');
          setUpdateMessage(data.message || 'Error al conectar con el servidor de actualizaciones.');
        }
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [isElectron]);

  const handleUpdateClick = async () => {
    if (!isElectron) {
      alert('Las actualizaciones automáticas por botón funcionan desde el ejecutable de escritorio (LGP Presupuestos.exe).');
      return;
    }

    if (updateStep === 'idle' || updateStep === 'up-to-date' || updateStep === 'error') {
      // Step 1: Check for updates
      setUpdateStep('checking');
      setUpdateMessage('Buscando actualizaciones...');
      try {
        await window.electronAPI.checkForUpdates();
      } catch (err) {
        setUpdateStep('error');
        setUpdateMessage('No se pudo comprobar actualizaciones: ' + err.message);
      }
    } else if (updateStep === 'available') {
      // Step 2: Download update
      setUpdateStep('downloading');
      setDownloadProgress(0);
      setUpdateMessage('Iniciando descarga...');
      try {
        await window.electronAPI.downloadUpdate();
      } catch (err) {
        setUpdateStep('error');
        setUpdateMessage('Error al descargar: ' + err.message);
      }
    } else if (updateStep === 'downloaded') {
      // Step 3: Install & Restart
      window.electronAPI.installUpdate();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSaveSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDownloadBackup = () => {
    window.location.href = '/api/backup';
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!json.items || !json.quotes) {
          throw new Error('Archivo de copia de seguridad no válido.');
        }
        await onRestoreBackup(json);
        setRestoreStatus('Copia de seguridad restaurada correctamente.');
        setTimeout(() => setRestoreStatus(''), 4000);
      } catch (err) {
        alert('Error al leer el archivo: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Configuración General</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Datos de la empresa, numeración y valores predeterminados.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Guardado correctamente</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Company Info Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand-600" />
              Datos Comerciales
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subtítulo / Rubro
              </label>
              <input
                type="text"
                value={formData.companySubtitle}
                onChange={(e) => setFormData({ ...formData, companySubtitle: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ubicación / Zona
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ituzaingó, Buenos Aires"
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Identificación Fiscal / CUIT
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Defaults for Quotes Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-600" />
              Valores por Defecto
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prefijo de Numeración
              </label>
              <input
                type="text"
                value={formData.quotePrefix}
                onChange={(e) => setFormData({ ...formData, quotePrefix: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                IVA Predeterminado (%)
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.defaultIva}
                onChange={(e) => setFormData({ ...formData, defaultIva: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Días de Validez
              </label>
              <input
                type="number"
                value={formData.defaultValidityDays}
                onChange={(e) => setFormData({ ...formData, defaultValidityDays: parseInt(e.target.value) || 15 })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Términos y Condiciones Predeterminados
            </label>
            <textarea
              rows="5"
              value={formData.defaultTerms}
              onChange={(e) => setFormData({ ...formData, defaultTerms: e.target.value })}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-500 leading-relaxed font-sans"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Guardar Ajustes</span>
          </button>
        </div>

      </form>

      {/* System Updates Section (Manual Update Flow) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3.5">
        <div className="border-b border-slate-100 pb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudDownload className="w-4 h-4 text-brand-600" />
            <h2 className="text-sm font-bold text-slate-900">Actualizaciones del Programa</h2>
          </div>
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            Versión actual: v{appVersion}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <div className="text-xs font-semibold text-slate-800">
              {updateMessage || 'Compruebe si existen nuevas versiones de LGP Presupuestos.'}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Al actualizar, todos sus presupuestos y tarifas se mantienen guardados.
            </p>

            {updateStep === 'downloading' && (
              <div className="mt-2 w-full sm:w-64 bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-brand-600 h-2 rounded-full transition-all duration-200" 
                  style={{ width: `${downloadProgress}%` }}
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="button"
              disabled={updateStep === 'checking' || updateStep === 'downloading'}
              onClick={handleUpdateClick}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all whitespace-nowrap ${
                updateStep === 'downloaded'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-pulse'
                  : updateStep === 'available'
                  ? 'bg-brand-600 hover:bg-brand-700 text-white'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              } disabled:opacity-50`}
            >
              {updateStep === 'checking' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : updateStep === 'available' ? (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar actualización {newVersion ? `(v${newVersion})` : ''}</span>
                </>
              ) : updateStep === 'downloading' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Descargando ({downloadProgress}%)...</span>
                </>
              ) : updateStep === 'downloaded' ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Actualizar y reiniciar</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Buscar actualización</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="border-b border-slate-100 pb-2">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-600" />
            Copia de Seguridad del Sistema
          </h2>
        </div>

        {restoreStatus && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg">
            {restoreStatus}
          </div>
        )}

        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Archivo de Respaldo (JSON)</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Restaurar desde Archivo</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

    </div>
  );
}
