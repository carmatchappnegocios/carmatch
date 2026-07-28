// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

// 🧠 CarMatch Intelligent Vehicle Taxonomy
// Single Source of Truth for Global Vehicle Data

// Heavy data (BRANDS, POPULAR_MODELS) moved to vehicleTaxonomyData.ts to fix TDZ bundler bug
export { BRANDS, POPULAR_MODELS } from './vehicleTaxonomyData'

export type VehicleCategory = 'Automóvil' | 'Motocicleta' | 'Camión' | 'Autobús' | 'Maquinaria' | 'Especial'

// 📅 Dynamic Year Generator (Current + 1)
export const getYears = () => {
    const currentYear = new Date().getFullYear() + 1
    const years = []
    for (let i = currentYear; i >= 1950; i--) {
        years.push(i)
    }
    return years
}

// 🚗 Categories and Subtypes
export var VEHICLE_CATEGORIES: Record<VehicleCategory, string[]> = {
    'Automóvil': ['Sedán', 'SUV', 'Pickup', 'Deportivo', 'Convertible', 'Coupe', 'Hatchback', 'Minivan', 'Wagon', 'Crossover', 'Limusina', 'Microcar', 'Roadster', 'Moke', 'Targa', 'Shooting Brake'],
    'Motocicleta': ['Deportiva', 'Cruiser', 'Touring', 'Off-road', 'Scooter', 'Chopper', 'Naked', 'Dual-Sport', 'Adventure', 'Cafe Racer', 'Scrambler', 'Enduro', 'Motocross', 'Trial', 'Triciclo (Spyder/Ryker)', 'Cuatrimoto (ATV)', 'Moped', 'Pocket Bike', 'Supermoto'],
    'Camión': ['Tractocamión (Trailer)', 'Torton', 'Rabon', 'Pickup Heavy Duty', 'Volteo', 'Cisterna (Pipa)', 'Refrigerado', 'Plataforma', 'Caja Seca', 'Grúa', 'Hormigonera (Olla)', 'Portacoches (Madrina)', 'Basurero', 'Chasis Cabina', 'Bomberos (Camión)', 'Blindado (Valores)', 'Compactador', 'Madre (Nodriza)'],
    'Autobús': ['Urbano', 'Interurbano', 'Turismo', 'Escolar', 'Microbús', 'Van Pasajeros', 'Articulado', 'Dos Pisos', 'Trolebús', 'Minibús', 'Shuttle Bus'],
    'Maquinaria': ['Excavadora', 'Retroexcavadora', 'Bulldozer', 'Montacargas', 'Tractor Agrícola', 'Cosechadora', 'Rodillo Compactador', 'Pavimentadora', 'Grúa Industrial', 'Cargador Frontal', 'Minicargador', 'Sembradora', 'Motoconformadora', 'Telehandler', 'Sideboom', 'Barredora Industrial', 'Zanjadora', 'Perforadora'],
    'Especial': ['UTV (RZR / Maverick / Side-by-Side)', 'Buggy / Arenero', 'Golf Cart', 'Go-kart', 'Motonieve', 'Ambulancia', 'Patrulla', 'Bomberos', 'Blindado', 'Food Truck', 'Casa Rodante (RV)', 'Remolque', 'Lowboy', 'Remolque Frigorífico', 'Plataforma Porta-contenedor']
}

// ⚙️ Technical Specs Options
export var TRANSMISSIONS = ['Manual', 'Automática', 'CVT', 'Dual Clutch (DCT)', 'Tiptronic', 'Secuencial', 'Semi-automática']
export var FUELS = ['Gasolina', 'Diésel', 'Híbrido (HEV)', 'Híbrido Enchufable (PHEV)', 'Eléctrico (BEV)', 'Gas LP', 'Gas Natural (GNC)', 'Hidrógeno (FCEV)', 'Etanol']
export var TRACTIONS = ['Delantera (FWD)', 'Trasera (RWD)', '4x4 (4WD)', 'Integral (AWD)', '6x4', '6x6', '8x4', '8x8']
export var COLORS = ['Blanco', 'Negro', 'Gris', 'Plata', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Naranja', 'Café', 'Beige', 'Oro', 'Bronce', 'Morado', 'Rosa', 'Bicolor', 'Mate', 'Otro']
export var CONDITIONS = ['Nuevo', 'Seminuevo (Casi Nuevo)', 'Usado', 'Para Restaurar', 'Para Piezas']

// 🌍 DICCIONARIO GLOBAL DE SINÓNIMOS (Base de Conocimiento para Inteligencia Artificial)
// Mapea términos coloquiales e internacionales a la taxonomía oficial de la BD
export var GLOBAL_SYNONYMS: Record<string, string> = {
    // Categorías
    'Carro': 'Automóvil', 'Coche': 'Automóvil', 'Auto': 'Automóvil', 'Nave': 'Automóvil', 'Fierro': 'Automóvil',
    'Voiture': 'Automóvil', 'Car': 'Automóvil', 'Vehicle': 'Automóvil',
    'Troca': 'Automóvil', 'Pickup': 'Automóvil', 'Camioneta': 'Automóvil', 'Truck': 'Automóvil',
    'Moto': 'Motocicleta', 'Burra': 'Motocicleta', 'Bike': 'Motocicleta', 'Motorcycle': 'Motocicleta',
    'Mano de chango': 'Maquinaria', 'Retro': 'Maquinaria', 'Excavator': 'Maquinaria',
    'Tracto': 'Camión', 'Trailer': 'Camión', 'Mula': 'Camión', 'Semi': 'Camión', 'Lorry': 'Camión',
    'Ute': 'Automóvil', 'Bakkie': 'Automóvil', 'Estate': 'Automóvil', 'Saloon': 'Automóvil', 'Wagon': 'Automóvil',
    'Camineta': 'Automóvil', 'Hondita': 'Motocicleta', 'Ranfla': 'Automóvil', 'Mueble': 'Automóvil',

    // Colores
    'Negra': 'Negro', 'Black': 'Negro', 'Noir': 'Negro', 'Dark': 'Negro', 'Preto': 'Negro',
    'Blanca': 'Blanco', 'White': 'Blanco', 'Blanc': 'Blanco', 'Branco': 'Blanco',
    'Roja': 'Rojo', 'Red': 'Rojo', 'Rouge': 'Rojo', 'Vermelho': 'Rojo',
    'Azul Oscuro': 'Azul', 'Blue': 'Azul', 'Bleu': 'Azul',
    'Gris rata': 'Gris', 'Gris obscuro': 'Gris', 'Gris claro': 'Gris', 'Grey': 'Gris', 'Silver': 'Plata', 'Plateado': 'Plata',
    'Verde limon': 'Verde', 'Verde militar': 'Verde', 'Green': 'Verde',
    'Naranja': 'Naranja', 'Orange': 'Naranja',

    // Marcas / Modelos (Slang)
    'Chevy': 'Chevrolet', 'Bimmer': 'BMW', 'Beema': 'BMW', 'Merc': 'Mercedes-Benz', 'Meche': 'Mercedes-Benz',
    'Lambo': 'Lamborghini', 'Rari': 'Ferrari', 'Vw': 'Volkswagen', 'Vocho': 'Volkswagen', 'Fusca': 'Volkswagen',
    'Mamalona': 'RAM', 'Yota': 'Toyota', 'Ramona': 'RAM', 'Panchita': 'Ford',

    // Términos de motor y estado (Slang)
    'Cero horas': '0 hrs', '0 km': 'Nuevo', 'Recien llegado': 'Importado', 'Clima helando': 'Aire Acondicionado',
    'Patas de hule': 'Llantas nuevas', 'Al 100': 'Excelente estado', 'Sin fallas': 'Excelente estado',
    'Diesel': 'Diésel', 'Poder stroke': 'PowerStroke', 'Cumins': 'Cummins', 'Duramax': 'Duramax',
    'Hemi': 'Hemi', 'Triton': 'Triton', 'Vortec': 'Vortec'
}

// 🧠 Helper to get features by category
export const getFeaturesByCategory = (category: VehicleCategory) => {
    const common = ['Alarma', 'GPS', 'Luces LED', 'Frenos ABS', 'Bluetooth', 'USB', 'Pantalla Touch']

    switch (category) {
        case 'Automóvil':
            return [
                ...common,
                // Confort
                'Aire Acondicionado', 'Climatizador Automático', 'Asientos de Piel', 'Asientos Eléctricos',
                'Asientos Calefactables', 'Asientos Ventilados', 'Quemacocos', 'Techo Panorámico',
                'Vidrios Eléctricos', 'Espejos Eléctricos', 'Volante Multifuncional', 'Cajuela Eléctrica',
                // Tech
                'Android Auto/CarPlay', 'Cargador Inalámbrico', 'Head-Up Display', 'Sistema de Sonido Premium',
                'Tablero Digital', 'Llave Inteligente (Keyless)', 'Cámara de Reversa', 'Cámara 360°',
                // Seguridad / ADAS
                'Bolsas de Aire (Airbags)', 'Sensores de Estacionamiento', 'Monitor de Punto Ciego',
                'Alerta de Cambio de Carril', 'Frenado Autónomo de Emergencia', 'Control Crucero Adaptativo',
                // Exterior
                'Rines de Aluminio', 'Faros de Niebla', 'Barras de Techo', 'Kit Deportivo'
            ]
        case 'Motocicleta':
            return [
                ...common,
                'Frenos de Disco', 'ABS en Curva', 'Control de Tracción', 'Quickshifter',
                'Modos de Manejo', 'Suspensión Electrónica', 'Amortiguador de Dirección',
                'Maletas Laterales', 'Top Case', 'Parabrisas', 'Defensas/Sliders',
                'Puños Calefactables', 'Asiento Comfort', 'Luces Auxiliares (Exploradoras)'
            ]
        case 'Camión':
            return [
                ...common,
                'Freno de Motor', 'Retardador', 'Camarote', 'Ejes Retráctiles', 'Suspensión de Aire',
                'Toma de Fuerza (PTO)', 'Deflector de Aire', 'Tanque Auxiliar', 'Rines de Aluminio',
                'Visera Exterior', 'Asiento Neumático', 'Eje Elevable'
            ]
        case 'Maquinaria':
            return [
                ...common,
                'Cabina Cerrada (ROPS/FOPS)', 'Aire Acondicionado', 'Calefacción', 'Joystick Control',
                'Estabilizadores', 'Cucharon 4en1', 'Línea Hidráulica Auxiliar', 'Ripper (Desgarrador)',
                'Zapatas Anchas', 'Llantas Sólidas'
            ]
        case 'Especial':
            return [
                ...common,
                'Winch (Cabrestante)', 'Roll Cage (Jaula)', 'Snorkel', 'Suspensión Lift Kit',
                'Llantas All-Terrain/Mud-Terrain', 'Luces LED Bar', 'Techo Rígido', 'Medios Puertas'
            ]
        default:
            return common
    }
}
// 💰 Global Currency Support
export var CURRENCIES = [
    { code: 'AED', name: 'Dirham (EAU)' },
    { code: 'AFN', name: 'Afgani' },
    { code: 'ALL', name: 'Lek' },
    { code: 'AMD', name: 'Dram' },
    { code: 'ANG', name: 'Florín (Antillas)' },
    { code: 'AOA', name: 'Kwanza' },
    { code: 'ARS', name: 'Peso (AR)' },
    { code: 'AUD', name: 'Dólar (AU)' },
    { code: 'AWG', name: 'Florín (Aruba)' },
    { code: 'AZN', name: 'Manat' },
    { code: 'BAM', name: 'Marco' },
    { code: 'BBD', name: 'Dólar (BB)' },
    { code: 'BDT', name: 'Taka' },
    { code: 'BGN', name: 'Lev' },
    { code: 'BHD', name: 'Dinar (BH)' },
    { code: 'BIF', name: 'Franco (BI)' },
    { code: 'BMD', name: 'Dólar (BM)' },
    { code: 'BND', name: 'Dólar (BN)' },
    { code: 'BOB', name: 'Boliviano' },
    { code: 'BRL', name: 'Real' },
    { code: 'BSD', name: 'Dólar (BS)' },
    { code: 'BTN', name: 'Ngultrum' },
    { code: 'BWP', name: 'Pula' },
    { code: 'BYN', name: 'Rublo (BY)' },
    { code: 'BZD', name: 'Dólar (BZ)' },
    { code: 'CAD', name: 'Dólar (CA)' },
    { code: 'CDF', name: 'Franco (CD)' },
    { code: 'CHF', name: 'Franco (CH)' },
    { code: 'CLP', name: 'Peso (CL)' },
    { code: 'CNY', name: 'Yuan' },
    { code: 'COP', name: 'Peso (CO)' },
    { code: 'CRC', name: 'Colón' },
    { code: 'CUP', name: 'Peso (CU)' },
    { code: 'CVE', name: 'Escudo' },
    { code: 'CZK', name: 'Corona (CZ)' },
    { code: 'DJF', name: 'Franco (DJ)' },
    { code: 'DKK', name: 'Corona (DK)' },
    { code: 'DOP', name: 'Peso (DO)' },
    { code: 'DZD', name: 'Dinar (DZ)' },
    { code: 'EGP', name: 'Libra (EG)' },
    { code: 'ERN', name: 'Nakfa' },
    { code: 'ETB', name: 'Birr' },
    { code: 'EUR', name: 'Euro' },
    { code: 'FJD', name: 'Dólar (FJ)' },
    { code: 'FKP', name: 'Libra (FK)' },
    { code: 'GBP', name: 'Libra (GB)' },
    { code: 'GEL', name: 'Lari' },
    { code: 'GHS', name: 'Cedi' },
    { code: 'GIP', name: 'Libra (GI)' },
    { code: 'GMD', name: 'Dalasi' },
    { code: 'GNF', name: 'Franco (GN)' },
    { code: 'GTQ', name: 'Quetzal' },
    { code: 'GYD', name: 'Dólar (GY)' },
    { code: 'HKD', name: 'Dólar (HK)' },
    { code: 'HNL', name: 'Lempira' },
    { code: 'HRK', name: 'Kuna' },
    { code: 'HTG', name: 'Gourde' },
    { code: 'HUF', name: 'Forinto' },
    { code: 'IDR', name: 'Rupia (ID)' },
    { code: 'ILS', name: 'Shekel' },
    { code: 'INR', name: 'Rupia (IN)' },
    { code: 'IQD', name: 'Dinar (IQ)' },
    { code: 'IRR', name: 'Rial (IR)' },
    { code: 'ISK', name: 'Corona (IS)' },
    { code: 'JMD', name: 'Dólar (JM)' },
    { code: 'JOD', name: 'Dinar (JO)' },
    { code: 'JPY', name: 'Yen' },
    { code: 'KES', name: 'Chelín (KE)' },
    { code: 'KGS', name: 'Som' },
    { code: 'KHR', name: 'Riel' },
    { code: 'KMF', name: 'Franco (KM)' },
    { code: 'KPW', name: 'Won (KP)' },
    { code: 'KRW', name: 'Won (KR)' },
    { code: 'KWD', name: 'Dinar (KW)' },
    { code: 'KYD', name: 'Dólar (KY)' },
    { code: 'KZT', name: 'Tenge' },
    { code: 'LAK', name: 'Kip' },
    { code: 'LBP', name: 'Libra (LB)' },
    { code: 'LKR', name: 'Rupia (LK)' },
    { code: 'LRD', name: 'Dólar (LR)' },
    { code: 'LSL', name: 'Loti' },
    { code: 'LYD', name: 'Dinar (LY)' },
    { code: 'MAD', name: 'Dirham (MA)' },
    { code: 'MDL', name: 'Leu' },
    { code: 'MGA', name: 'Ariary' },
    { code: 'MKD', name: 'Denar' },
    { code: 'MMK', name: 'Kyat' },
    { code: 'MNT', name: 'Tugrik' },
    { code: 'MOP', name: 'Pataca' },
    { code: 'MRU', name: 'Ouguiya' },
    { code: 'MUR', name: 'Rupia (MU)' },
    { code: 'MVR', name: 'Rufiyaa' },
    { code: 'MWK', name: 'Kwacha' },
    { code: 'MXN', name: 'Peso (MX)' },
    { code: 'MYR', name: 'Ringgit' },
    { code: 'MZN', name: 'Metical' },
    { code: 'NAD', name: 'Dólar (NA)' },
    { code: 'NGN', name: 'Naira' },
    { code: 'NIO', name: 'Córdoba' },
    { code: 'NOK', name: 'Corona (NO)' },
    { code: 'NPR', name: 'Rupia (NP)' },
    { code: 'NZD', name: 'Dólar (NZ)' },
    { code: 'OMR', name: 'Rial (OM)' },
    { code: 'PAB', name: 'Balboa' },
    { code: 'PEN', name: 'Sol' },
    { code: 'PGK', name: 'Kina' },
    { code: 'PHP', name: 'Peso (PH)' },
    { code: 'PKR', name: 'Rupia (PK)' },
    { code: 'PLN', name: 'Zloty' },
    { code: 'PYG', name: 'Guaraní' },
    { code: 'QAR', name: 'Rial (QA)' },
    { code: 'RON', name: 'Leu (RO)' },
    { code: 'RSD', name: 'Dinar (RS)' },
    { code: 'RUB', name: 'Rublo' },
    { code: 'RWF', name: 'Franco (RW)' },
    { code: 'SAR', name: 'Riyal' },
    { code: 'SBD', name: 'Dólar (SB)' },
    { code: 'SCR', name: 'Rupia (SC)' },
    { code: 'SDG', name: 'Libra (SD)' },
    { code: 'SEK', name: 'Corona (SE)' },
    { code: 'SGD', name: 'Dólar (SG)' },
    { code: 'SHP', name: 'Libra (SH)' },
    { code: 'SLL', name: 'Leone' },
    { code: 'SOS', name: 'Chelín (SO)' },
    { code: 'SRD', name: 'Dólar (SR)' },
    { code: 'SSP', name: 'Libra (SS)' },
    { code: 'STN', name: 'Dobra' },
    { code: 'SVC', name: 'Colón (SV)' },
    { code: 'SYP', name: 'Libra (SY)' },
    { code: 'SZL', name: 'Lilangeni' },
    { code: 'THB', name: 'Baht' },
    { code: 'TJS', name: 'Somoni' },
    { code: 'TMT', name: 'Manat (TM)' },
    { code: 'TND', name: 'Dinar (TN)' },
    { code: 'TOP', name: 'Pa\'anga' },
    { code: 'TRY', name: 'Lira' },
    { code: 'TTD', name: 'Dólar (TT)' },
    { code: 'TWD', name: 'Dólar (TW)' },
    { code: 'TZS', name: 'Chelín (TZ)' },
    { code: 'UAH', name: 'Grivna' },
    { code: 'UGX', name: 'Chelín (UG)' },
    { code: 'USD', name: 'Dólar (US)' },
    { code: 'UYU', name: 'Peso (UY)' },
    { code: 'UZS', name: 'Som (UZ)' },
    { code: 'VES', name: 'Bolívar' },
    { code: 'VND', name: 'Dong' },
    { code: 'VUV', name: 'Vatu' },
    { code: 'WST', name: 'Tala' },
    { code: 'XAF', name: 'Franco (BEAC)' },
    { code: 'XCD', name: 'Dólar (EC)' },
    { code: 'XOF', name: 'Franco (BCEAO)' },
    { code: 'XPF', name: 'Franco (CFP)' },
    { code: 'YER', name: 'Rial (YE)' },
    { code: 'ZAR', name: 'Rand' },
    { code: 'ZMW', name: 'Kwacha (ZM)' },
    { code: 'ZWL', name: 'Dólar (ZW)' }
]

export var COUNTRY_CURRENCY_MAP: Record<string, string> = {
    'CN': 'CNY', 'JP': 'JPY', 'KR': 'KRW', 'IN': 'INR', 'RU': 'RUB', 'UA': 'UAH', 'AU': 'AUD'
}

export var COUNTRY_DISTANCE_UNIT_MAP: Record<string, 'km' | 'mi'> = {
    'US': 'mi',
    'GB': 'mi',
    'LR': 'mi',
    'MM': 'mi'
}

/**
 * 🗺️ Map CarMatch internal locales to BCP-47 tags
 */
export const getIntlLocale = (locale: string): string => {
    const maps: Record<string, string> = {
        es: 'es-MX', en: 'en-US', pt: 'pt-BR', fr: 'fr-FR', de: 'de-DE',
        it: 'it-IT', zh: 'zh-CN', ja: 'ja-JP', ru: 'ru-RU', ko: 'ko-KR',
        ar: 'ar-SA', hi: 'hi-IN', tr: 'tr-TR', nl: 'nl-NL', pl: 'pl-PL',
        sv: 'sv-SE', id: 'id-ID', th: 'th-TH', vi: 'vi-VN', ur: 'ur-PK', he: 'he-IL'
    }
    return maps[locale] || 'es-MX'
}

/**
 * 🔢 Formatea un número según el locale
 */
export const formatNumber = (num: any, locale: string = 'es') => {
    try {
        const val = typeof num === 'string' ? parseFloat(num) : num;
        if (isNaN(val)) return '0';
        return new Intl.NumberFormat(getIntlLocale(locale)).format(val);
    } catch (e) {
        return String(num || '0');
    }
}

/**
 * 💰 Formatea el precio con separadores de miles y moneda
 */
export const formatPrice = (price: any, currency: string = 'MXN', locale: string = 'es') => {
    try {
        const val = typeof price === 'string' ? parseFloat(price) : price;
        if (isNaN(val)) return `${currency} 0`;

        const formatter = new Intl.NumberFormat(getIntlLocale(locale), {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
        const formattedPrice = formatter.format(val);

        // Agregar el código de moneda al final para mayor claridad
        // Ejemplo: "$98,689,895 MXN" en lugar de solo "$98,689,895"
        if (!formattedPrice.includes(currency)) {
            return `${formattedPrice} ${currency}`;
        }
        return formattedPrice;
    } catch (e) {
        return `${currency} ${formatNumber(price, locale)}`;
    }
}