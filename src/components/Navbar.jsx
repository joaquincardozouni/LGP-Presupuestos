import React from 'react';
import { 
  FileText, 
  Layers, 
  Calculator, 
  History, 
  Settings, 
  BarChart3
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, quoteCount }) {
  const navItems = [
    { id: 'dashboard', label: 'Inicio', icon: BarChart3 },
    { id: 'quote', label: 'Presupuesto', icon: FileText },
    { id: 'catalog', label: 'Tarifario & Ítems', icon: Layers },
    { id: 'm2calc', label: 'Calculador m²', icon: Calculator },
    { id: 'history', label: 'Historial', icon: History, badge: quoteCount },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center font-black text-xl tracking-wider text-white shadow-md transition-transform group-hover:scale-105">
              LGP
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight leading-none">
                LGP
              </span>
              <p className="text-[11px] text-slate-400 font-medium">Ituzaingó • Construcciones & Herrería</p>
            </div>
          </div>

          {/* Navigation Links with comfortable breathing room */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>
      </div>

      {/* Mobile Navigation bar */}
      <div className="md:hidden flex overflow-x-auto px-2 py-2 border-t border-slate-800 bg-slate-900 gap-1 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md whitespace-nowrap ${
                isActive ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
