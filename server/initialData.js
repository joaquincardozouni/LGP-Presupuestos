export const initialSettings = {
  companyName: "LGP",
  companySubtitle: "Construcciones & Herrería",
  taxId: "CUIT 30-71234567-8",
  phone: "+54 9 11 3445-5720",
  email: "contacto@lgp.com.ar",
  address: "Ituzaingó, Buenos Aires",
  website: "",
  currency: "ARS",
  currencySymbol: "$",
  defaultIva: 21,
  defaultValidityDays: 15,
  defaultTerms: "• Validez de la oferta: 15 días corridos desde la fecha de emisión.\n• Forma de pago: 50% de anticipo al aceptar el presupuesto y 50% contra entrega o avance convenido.\n• Los precios están expresados en Pesos Argentinos (ARS) salvo indicación contraria.\n• No incluye trabajos de terceros ni reformas estructurales no especificadas.",
  quotePrefix: "LGP-",
  nextQuoteNumber: 1001
};

export const initialItems = [
  {
    id: "itm-1",
    code: "HER-001",
    name: "Portón Corredizo Automatizado en Chapa / Hierro",
    category: "Herrería",
    unit: "unidad",
    price: 450000,
    description: "Estructura en caño tubular reforzado, chapa plegada, bastidor perimetral y guías de piso."
  },
  {
    id: "itm-2",
    code: "HER-002",
    name: "Rejas de Seguridad para Ventana en Hierro Macizo",
    category: "Herrería",
    unit: "m²",
    price: 68000,
    description: "Hierro redondo o cuadrado de 1/2 con planchuela perforada y grampas de amure a mampostería."
  },
  {
    id: "itm-3",
    code: "HER-003",
    name: "Estructura Metálica para Techo / Tinglado",
    category: "Herrería",
    unit: "m²",
    price: 52000,
    description: "Cabreadas y correas en perfil C galvanizado, soldadura corrida y tratamiento anticorrosivo."
  },
  {
    id: "itm-4",
    code: "REV-004",
    name: "Colocación de Porcelanato / Cerámica",
    category: "Revestimientos",
    unit: "m²",
    price: 18500,
    description: "Mano de obra para colocación, nivelación y tomado de juntas en pisos o paredes."
  },
  {
    id: "itm-5",
    code: "PIN-005",
    name: "Pintura Látex Interior",
    category: "Pintura",
    unit: "m²",
    price: 6500,
    description: "Preparación de superficie, lijado, enduido puntual y 2 manos de látex lavable."
  },
  {
    id: "itm-6",
    code: "PIN-006",
    name: "Pintura Exterior Impermeabilizante",
    category: "Pintura",
    unit: "m²",
    price: 8900,
    description: "Limpieza, sellador fijador y 3 manos de membrana líquida o pintura elastomérica."
  },
  {
    id: "itm-7",
    code: "DURL-007",
    name: "Tabique de Placa de Yeso (Durlock) con Estructura",
    category: "Construcción en Seco",
    unit: "m²",
    price: 24000,
    description: "Perfiles solera y montante de 70mm, emplacado simple de 12.5mm por ambas caras y tomado de juntas."
  },
  {
    id: "itm-8",
    code: "DURL-008",
    name: "Cielorraso Suspendido de Yeso",
    category: "Construcción en Seco",
    unit: "m²",
    price: 21500,
    description: "Estructura galvanizada suspendida, placas estándar 9.5mm, encintado y masillado listo para pintar."
  },
  {
    id: "itm-9",
    code: "ALB-009",
    name: "Mampostería de Ladrillo Hueco del 12",
    category: "Albañilería",
    unit: "m²",
    price: 22000,
    description: "Levantamiento de pared con mortero de cemento, cal y arena. Incluye trabas y niveles."
  },
  {
    id: "itm-10",
    code: "ALB-010",
    name: "Contrapiso y Carpeta de Cemento",
    category: "Albañilería",
    unit: "m²",
    price: 19500,
    description: "Contrapiso de cascote nivelado y carpeta hidrófuga lista para recibir piso."
  },
  {
    id: "itm-11",
    code: "MAT-011",
    name: "Bolsa de Cemento Portland 50kg",
    category: "Materiales",
    unit: "bolsa",
    price: 13500,
    description: "Cemento normal de primera marca para albañilería."
  },
  {
    id: "itm-12",
    code: "SERV-012",
    name: "Flete y Descarga en Obra",
    category: "Servicios",
    unit: "global",
    price: 65000,
    description: "Transporte y descarga a pie de obra en zona oeste."
  }
];

export const initialQuotes = [
  {
    id: "quote-sample-1",
    number: "LGP-2026-1001",
    date: "2026-11-10",
    validUntil: "2026-11-25",
    status: "Pendiente",
    client: {
      name: "Martín Rodríguez",
      company: "Obra Ituzaingó",
      taxId: "20-33445566-9",
      phone: "+54 9 11 6789-0123",
      email: "martin@email.com",
      address: "Ituzaingó, Buenos Aires",
      notes: "Coordinar entrega de herrería y materiales."
    },
    items: [
      {
        id: "qi-1",
        itemId: "itm-1",
        title: "Portón Corredizo Automatizado 3.00m x 2.20m",
        description: "Construcción en hierro estructural y chapa reforzada con motor corredizo instalado",
        unit: "unidad",
        quantity: 1,
        unitPrice: 450000,
        itemDiscount: 0,
        subtotal: 450000
      },
      {
        id: "qi-2",
        itemId: "itm-2",
        title: "Rejas de Seguridad para Ventanales Frente",
        description: "Hierro macizo redondo de 1/2 con planchuelas de fijación (14 m²)",
        unit: "m²",
        quantity: 14,
        unitPrice: 68000,
        itemDiscount: 5,
        subtotal: 904400
      }
    ],
    checks: {
      applyIva: true,
      ivaRate: 21,
      applyDiscount: false,
      discountType: "percent",
      discountValue: 0,
      applyOtherTax: false,
      otherTaxName: "Percepción IIBB",
      otherTaxRate: 3.5,
      applyShipping: true,
      shippingAmount: 45000,
      shippingNote: "Flete y descarga en obra en Ituzaingó",
      applyLaborExtra: false,
      laborExtraAmount: 0,
      laborExtraNote: "",
      includeTerms: true,
      includeSignatures: true,
      paymentCondition: "50% de anticipo al aceptar y 50% contra entrega"
    },
    currency: "ARS",
    currencySymbol: "$",
    terms: "• Validez de la oferta: 15 días corridos.\n• Anticipo 50% al iniciar y 50% al finalizar las etapas.",
    notes: "Presupuesto inicial obra Ituzaingó.",
    totals: {
      subtotal: 1354400,
      discountAmount: 0,
      netSubtotal: 1354400,
      ivaAmount: 284424,
      otherTaxAmount: 0,
      shippingAmount: 45000,
      laborExtraAmount: 0,
      grandTotal: 1683824
    },
    createdAt: "2026-11-10T14:30:00.000Z",
    updatedAt: "2026-11-10T14:30:00.000Z"
  }
];
