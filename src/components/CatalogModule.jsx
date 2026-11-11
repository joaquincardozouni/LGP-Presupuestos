import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy, 
  X, 
  Check, 
  Download, 
  Upload, 
  Tag, 
  DollarSign, 
  HelpCircle,
  FolderOpen
} from 'lucide-react';

export default function CatalogModule({ items = [], onSaveItem, onDeleteItem, settings = {} }) {
  const currencySymbol = settings.currencySymbol || '$';

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedUnit, setSelectedUnit] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Materiales',
    unit: 'unidad',
    price: '',
    description: ''
  });

  // Extract unique categories and units
  const categories = useMemo(() => {
    const cats = new Set(items.map(i => i.category || 'General'));
    return ['ALL', ...Array.from(cats)];
  }, [items]);

  const units = useMemo(() => {
    const un = new Set(items.map(i => i.unit || 'unidad'));
    return ['ALL', ...Array.from(un)];
  }, [items]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchUnit = selectedUnit === 'ALL' || item.unit === selectedUnit;

      return matchSearch && matchCategory && matchUnit;
    });
  }, [items, searchTerm, selectedCategory, selectedUnit]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      code: `ART-${items.length + 101}`,
      name: '',
      category: 'Materiales',
      unit: 'unidad',
      price: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      code: item.code || '',
      name: item.name || '',
      category: item.category || 'General',
      unit: item.unit || 'unidad',
      price: item.price !== undefined ? item.price : '',
      description: item.description || ''
    });
    setIsModalOpen(true);
  };

  const handleDuplicate = (item) => {
    const duplicated = {
      ...item,
      id: undefined,
      code: `${item.code || 'ART'}-COPIA`,
      name: `${item.name} (Copia)`
    };
    onSaveItem(duplicated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Por favor ingrese el nombre del ítem');
      return;
    }
    const itemToSave = {
      ...(editingItem ? { id: editingItem.id } : {}),
      code: formData.code.trim(),
      name: formData.name.trim(),
      category: formData.category,
      unit: formData.unit,
      price: parseFloat(formData.price) || 0,
      description: formData.description.trim()
    };
    onSaveItem(itemToSave);
    setIsModalOpen(false);
  };

  const formatMoney = (val) => {
    return new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Código', 'Nombre', 'Categoría', 'Unidad', 'Precio Unitario', 'Descripción'];
    const rows = items.map(i => [
      `"${i.code || ''}"`,
      `"${i.name || ''}"`,
      `"${i.category || ''}"`,
      `"${i.unit || ''}"`,
      i.price || 0,
      `"${(i.description || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LGP_Tarifario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tarifario de Ítems y Precios Base</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Materiales, mano de obra, trabajos de herrería y servicios con precios por unidad.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nuevo Ítem</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por código, nombre o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
          />
        </div>

        {/* Category & Unit Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Tag className="w-3.5 h-3.5" />
            <span>Categoría:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'ALL' ? 'Todas las categorías' : cat}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium ml-2">
            <span>Unidad:</span>
          </div>
          <select
            value={selectedUnit}
            onChange={(e) => setSelectedUnit(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {units.map(un => (
              <option key={un} value={un}>
                {un === 'ALL' ? 'Todas las unidades' : un}
              </option>
            ))}
          </select>

          {(searchTerm || selectedCategory !== 'ALL' || selectedUnit !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setSelectedUnit('ALL');
              }}
              className="text-xs text-brand-600 hover:text-brand-800 font-medium px-2 py-1"
            >
              Limpiar filtros
            </button>
          )}
        </div>

      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium text-slate-700">No se encontraron ítems en la tarifa</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm || selectedCategory !== 'ALL'
                ? 'Prueba modificando los filtros de búsqueda.'
                : 'Empieza agregando tu primer ítem con el botón "Nuevo Ítem".'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 font-semibold w-28">Código</th>
                  <th className="py-3 px-4 font-semibold">Ítem / Concepto</th>
                  <th className="py-3 px-4 font-semibold w-40">Categoría</th>
                  <th className="py-3 px-4 font-semibold w-24">Unidad</th>
                  <th className="py-3 px-4 font-semibold text-right w-36">Precio Unitario</th>
                  <th className="py-3 px-4 font-semibold text-center w-28">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                    
                    {/* Código */}
                    <td className="py-3 px-4 font-mono text-xs font-semibold text-slate-600">
                      {item.code || '-'}
                    </td>

                    {/* Nombre y Descripción */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                        {item.name}
                      </div>
                      {item.description && (
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {item.description}
                        </div>
                      )}
                    </td>

                    {/* Categoría */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {item.category || 'General'}
                      </span>
                    </td>

                    {/* Unidad */}
                    <td className="py-3 px-4 text-xs font-semibold text-slate-700 uppercase">
                      {item.unit || 'unidad'}
                    </td>

                    {/* Precio Unitario */}
                    <td className="py-3 px-4 text-right font-bold text-slate-900 font-mono text-sm">
                      {currencySymbol} {formatMoney(item.price)}
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          title="Editar ítem"
                          className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(item)}
                          title="Duplicar ítem"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Estás seguro de eliminar "${item.name}" del tarifario?`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          title="Eliminar ítem"
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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

        {/* Footer info */}
        <div className="bg-slate-50 p-3 px-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{filteredItems.length} de {items.length} ítems en catálogo</span>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900">
                  {editingItem ? 'Editar Ítem del Tarifario' : 'Añadir Nuevo Ítem a la Tarifa'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código / Ref.
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ej: MAT-01"
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                  />
                </div>
                
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    list="category-suggestions"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Materiales, Mano de Obra, etc."
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <datalist id="category-suggestions">
                    <option value="Materiales" />
                    <option value="Mano de Obra" />
                    <option value="Revestimientos" />
                    <option value="Construcción en Seco" />
                    <option value="Pintura" />
                    <option value="Electricidad" />
                    <option value="Instalaciones" />
                    <option value="Servicios" />
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Ítem / Título <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Colocación de Porcelanato 60x60"
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unidad de Medida
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="unidad">unidad (u)</option>
                    <option value="m²">metro cuadrado (m²)</option>
                    <option value="m lineal">metro lineal (ml)</option>
                    <option value="litro">litro (lt)</option>
                    <option value="hora">hora (hs)</option>
                    <option value="bolsa">bolsa</option>
                    <option value="kg">kilogramo (kg)</option>
                    <option value="global">global (gl)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Precio Base por Unidad ({currencySymbol}) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                      {currencySymbol}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-7 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descripción / Detalle Técnico (Opcional)
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalles sobre materiales incluidos, especificaciones o condiciones de colocación..."
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all"
                >
                  {editingItem ? 'Guardar Cambios' : 'Añadir al Tarifario'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
