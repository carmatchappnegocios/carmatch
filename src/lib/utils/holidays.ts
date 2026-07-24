/**
 * 🇲🇽 GESTOR DE FESTIVIDADES MÉXICO v1.0
 */

export interface Holiday {
    name: string;
    month: number; // 0-11
    day: number;
    description: string;
}

export const MEXICAN_HOLIDAYS: Holiday[] = [
    { name: 'Año Nuevo', month: 0, day: 1, description: 'Nuevos comienzos, metas y autos nuevos.' },
    { name: 'Día de Reyes', month: 0, day: 6, description: 'Regalos, familia y tradición.' },
    { name: 'Día de San Valentín', month: 1, day: 14, description: 'Amor, citas perfectas en auto y amistad.' },
    { name: 'Día de la Constitución', month: 1, day: 5, description: 'Patriotismo y respeto.' },
    { name: 'Natalicio de Benito Juárez', month: 2, day: 21, description: 'Respeto al derecho ajeno.' },
    { name: 'Semana Santa', month: 3, day: 15, description: 'Vacaciones, viajes en carretera y playa.' }, // Aproximado, varía cada año pero podemos dejarlo fijo para simplificar o ajustarlo
    { name: 'Día del Niño', month: 3, day: 30, description: 'Diversión, familia y seguridad infantil en el auto.' },
    { name: 'Día del Trabajo', month: 4, day: 1, description: 'Esfuerzo y recompensa.' },
    { name: 'Día de la Batalla de Puebla', month: 4, day: 5, description: 'Orgullo nacional.' },
    { name: 'Día de las Madres', month: 4, day: 10, description: 'El mejor regalo para mamá: seguridad y comodidad.' },
    { name: 'Día del Padre', month: 5, day: 16, description: 'El auto que papá siempre quiso.' }, // Tercer domingo de junio aprox
    { name: 'Día de la Independencia', month: 8, day: 16, description: '¡Viva México! El orgullo de rodar por nuestra tierra.' },
    { name: 'Día de Muertos', month: 10, day: 2, description: 'Tradición, ofrendas y el viaje eterno.' },
    { name: 'Aniversario de la Revolución', month: 10, day: 20, description: 'Movimiento y cambio.' },
    { name: 'Día de la Virgen de Guadalupe', month: 11, day: 12, description: 'Fe y peregrinaciones.' },
    { name: 'Nochebuena/Navidad', month: 11, day: 24, description: 'Unión familiar y el mejor CarMatch de tu vida.' },
    { name: 'Fin de Año', month: 11, day: 31, description: 'Cierre de ciclos y nuevos proyectos.' }
];

/**
 * Retorna la festividad si estamos a 7 días o menos de ella.
 */
export function getUpcomingHoliday(date: Date) {
    const dayMs = 24 * 60 * 60 * 1000;
    
    for (const h of MEXICAN_HOLIDAYS) {
        const holidayDate = new Date(date.getFullYear(), h.month, h.day);
        
        // Si el día ya pasó este año, mirar el próximo año (solo para diciembre/enero)
        if (date.getTime() > holidayDate.getTime() + dayMs) {
            holidayDate.setFullYear(date.getFullYear() + 1);
        }

        const diffTime = holidayDate.getTime() - date.getTime();
        const diffDays = Math.ceil(diffTime / dayMs);

        if (diffDays >= 0 && diffDays <= 7) {
            return { ...h, daysRemaining: diffDays };
        }
    }
    
    return null;
}
