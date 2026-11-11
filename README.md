# Sistema de Presupuestos & Tarifario LGP

Aplicación integral, moderna, escalable y sencilla de usar diseñada específicamente para la empresa **LGP**. Permite gestionar detalles de tarifas con precios unitarios, emitir presupuestos 100% personalizados, calcular superficies por metro cuadrado con márgenes de desperdicio y exportar hojas de presupuesto profesionales en PDF con membrete corporativo.

---

## 🚀 Cómo iniciar el programa

### Opción 1: Ejecutable Portátil (.exe) - Recomendada
Simplemente haga doble clic en el archivo:
- 👉 **[`LGP Presupuestos.exe`](file:///c:/Users/User/Documents/LucasPaez/LGP%20Presupuestos.exe)**

*No requiere instalar Node.js ni abrir ninguna consola o archivo BAT.* Se abre directamente como un programa nativo de Windows en su propia ventana. Es un único archivo que puedes compartir por pendrive o Google Drive a cualquier otra persona.

### Opción 2: Modo Local / Web
Si estás desarrollando o prefieres abrirlo desde la terminal:
- **Doble clic en:** `INICIAR_LGP.bat` (o `npm start`)
- Acceso en el navegador: `http://localhost:3001`

*(Para compilar un nuevo `.exe` tras hacer cambios de código: ejecutar `npm run dist:portable`).*

---

## 📋 Módulos del Sistema

### 1. 📊 Inicio & Métricas (Dashboard)
- Resumen ejecutivo de total cotizado, presupuestos aprobados, borradores y en negociación.
- Accesos directos para crear presupuestos, consultar tarifas o calcular m².
- Tabla de cotizaciones recientes con cambio rápido y visualización.

### 2. 📝 Generador de Presupuestos (100% Personalizable)
- **Cabecera comercial:** Número de presupuesto (auto-incrementable o personalizable e.g. `LGP-2026-1002`), fechas de emisión y validez, y estado comercial.
- **Datos del Cliente:** Nombre, empresa, CUIT/DNI, teléfono, email, dirección de obra y notas.
- **Lista de Ítems totalmente adaptable:**
  - Botón para **Añadir desde Tarifario** (busca e inserta con 1 clic).
  - Botón para **Añadir Ítem Libre / Personalizado** (línea en blanco para escribir cualquier concepto).
  - **Edición en tiempo real por fila:**
    - Modificar el **título o nombre** (ej: renombrar un ítem del catálogo para ese cliente en particular sin alterar el catálogo maestro).
    - Modificar la **descripción técnica**.
    - Modificar la **unidad** (`unidad`, `m²`, `m lineal`, `litro`, `hora`, etc.).
    - Modificar la **cantidad** (con soporte de decimales).
    - Modificar el **precio unitario** (establecer precios especiales únicamente para esa cotización).
    - Descuento individual por línea (%).
    - Reordenar filas (subir/bajar) y duplicar filas.
- **Panel de Checks & Modificadores de Cálculo:**
  - ☑️ **Aplicar IVA:** Checkbox activable/desactivable con alícuotas (21%, 10.5%, 27% o personalizada).
  - ☑️ **Descuento Global:** Checkbox para aplicar descuento en porcentaje (%) o monto fijo ($).
  - ☑️ **Otros Impuestos / Percepciones:** Checkbox configurable (ej. IIBB CABA, Ingresos Brutos Prov. Bs. As.).
  - ☑️ **Flete / Costo de Logística:** Checkbox para incluir fletes con detalle y monto.
  - ☑️ **Mano de Obra extra / Montaje especial:** Checkbox para cargos adicionales de instalación.
  - ☑️ **Condición de Pago:** Texto de anticipos y cuotas (ej: *50% de anticipo al aceptar y 50% contra entrega*).
  - Selector de moneda: Pesos ($ ARS), Dólares (U$S USD) o Euros (€ EUR).
- **Caja de Totales en Tiempo Real:** Subtotal bruto, descuentos, subtotal neto imponible, impuestos, flete y total general.
- **Términos y Condiciones:** Cláusulas de validez de oferta y garantías impresas en el documento.

### 3. 📦 Tarifario & Catálogo de Ítems
- Base de datos de productos y servicios con **precios base por unidad**.
- Soporte para unidades de medida: `u`, `m²`, `m lineal`, `litro`, `hora`, `bolsa`, `kg`, `global`.
- Buscador en tiempo real por código, nombre o descripción.
- Filtros por categoría (`Materiales`, `Mano de Obra`, `Revestimientos`, `Construcción en Seco`, `Pintura`, `Electricidad`, `Instalaciones`, `Servicios`).
- Acciones: Agregar ítem, Editar, Duplicar, Eliminar y Exportar a Excel (CSV).

### 4. 📐 Calculador por Metro Cuadrado (m²)
- Cálculo detallado de superficies complejas con desglose por paños o ambientes (ej. *Living, Cocina, Pared Norte*).
- Dimensiones individuales: `Largo (m) × Ancho/Alto (m) × Cantidad = m²`.
- **Margen por Desperdicio y Recortes (%):** Presets de 0%, 5%, 10%, 15%, 20% o personalizado.
- **Precio por m²:** Posibilidad de vincular un ítem existente de la tarifa o ingresar un precio libre.
- 🚀 **Botón "Insertar en Presupuesto Activo":** Transfiere automáticamente el cálculo completo con todo el desglose métrico detallado directamente a la cotización activa.

### 5. 📂 Historial de Cotizaciones
- Registro completo de todos los presupuestos emitidos.
- Filtros rápidos por estado comercial: `Todos`, `Borrador`, `Pendiente`, `Aprobado`, `Facturado`, `Rechazado`.
- Buscador por cliente, número o detalles.
- Modificación de estado con un clic directo desde la tabla.
- Duplicación de presupuestos anteriores como plantilla para clientes nuevos.
- Exportación del historial a archivo Excel / CSV.

### 6. 🖨️ Vista de Impresión & Exportación PDF
- Formato A4 ultra prolijo con membrete y tipografía corporativa de **LGP**.
- Encabezado con datos fiscales, teléfono, email y dirección de LGP.
- Ficha de cliente y resumen de fechas.
- Tabla de conceptos, cantidades, precios unitarios y subtotales.
- Cuadro de liquidación con detalle de IVA, impuestos y descuentos aplicados.
- Cláusulas de términos comerciales, plazos y condiciones de pago.
- Espacio para firma de LGP y firma de conformidad del cliente.
- Botón **"Imprimir / Guardar como PDF"** que invoca el motor de impresión nativo del navegador listo para guardar en PDF sin pérdida de calidad.

### 7. ⚙️ Configuración & Respaldos
- Datos comerciales de LGP (Nombre, CUIT, teléfonos, emails, dirección, sitio web).
- Valores predeterminados para nuevas cotizaciones (Prefijo, IVA estándar, días de validez, cláusulas base).
- **Copia de seguridad en 1 clic:** Descarga de archivo `LGP_Backup_YYYY-MM-DD.json` con todos los datos.
- **Restauración:** Carga de respaldos anteriores.

---

## 💾 Persistencia de Datos

Todos los datos se guardan de forma permanente y segura en la carpeta `./data/`:
- `data/items.json`: Catálogo de ítems y precios de tarifa.
- `data/quotes.json`: Historial de todos los presupuestos.
- `data/settings.json`: Configuración y datos de la empresa LGP.

Esto garantiza que la información nunca se pierda y sea fácil de respaldar o copiar a una memoria USB.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide Icons.
- **Backend:** Node.js, Express, almacenamiento transaccional JSON atómico.
- **Compatibilidad:** 100% compatible con Windows, Chrome, Microsoft Edge y Firefox.
