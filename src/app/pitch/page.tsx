'use client'
// Página solo para imprimir como PDF: Ctrl+P → Guardar como PDF
export default function PitchPDF() {
  return (
    <div style={{ 
      fontFamily: "'Segoe UI', sans-serif", 
      background: 'white', 
      color: '#0f172a', 
      padding: '20px', 
      width: '100%',
      maxWidth: '800px', 
      margin: '0 auto',
      minHeight: '100vh',
      boxSizing: 'border-box'
    }}>
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        * { font-family: 'Inter', 'Segoe UI', sans-serif; box-sizing: border-box; }
        body { background: white; margin: 0; padding: 0; }
        
        /* Ajustes para Móvil */
        @media (max-width: 600px) {
          h1 { font-size: 24px !important; }
          .header-box { padding: 24px 20px !important; }
          .stat-grid { grid-template-columns: 1fr 1fr !important; }
          .feature-grid { grid-template-columns: 1fr !important; }
          .safety-grid { grid-template-columns: 1fr !important; gap: 15px !important; }
          .price-box { flex-direction: column !important; text-align: center !important; gap: 10px !important; }
          .price-box div { text-align: center !important; }
        }

        @media print {
          @page { margin: 10mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none; }
        }
      `}</style>

      {/* ENCABEZADO */}
      <div className="header-box" style={{ borderRadius: 16, background: 'linear-gradient(135deg, #0369a1 0%, #0284c7 60%, #f97316 100%)', padding: '36px 40px', marginBottom: 32, color: 'white' }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', opacity: 0.8 }}>Propuesta Comercial Confidencial</p>
        <h1 style={{ margin: '0 0 10px', fontSize: 34, fontWeight: 900, lineHeight: 1.15 }}>
          Tu App Aprobada en<br />Google Play en 14 Días
        </h1>
        <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
          Servicio garantizado de prueba cerrada con testers humanos reales distribuidos en México.
        </p>
      </div>

      {/* CASO DE ÉXITO */}
      <div style={{ border: '2px solid #0369a1', borderRadius: 16, padding: '24px 28px', marginBottom: 28, background: '#f0f9ff' }}>
        <p style={{ margin: '0 0 6px', fontSize: 10, fontWeight: 900, letterSpacing: '0.25em', color: '#0369a1', textTransform: 'uppercase' }}>✅ Caso de Éxito Real — Primer Cliente</p>
        <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 900, color: '#0f172a' }}>CarMatch Social — carmatchapp.net</h2>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#334155', lineHeight: 1.6 }}>
          App de compra y venta de vehículos en México. Requería superar la prueba cerrada de Google Play para acceder a producción y llegar a millones de usuarios.
        </p>
        <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { n: '25', label: 'Testers reclutados' },
            { n: '14', label: 'Activos al día 1' },
            { n: '14', label: 'Días de prueba' },
            { n: '100%', label: 'Distribuidos en MX' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', background: 'white', borderRadius: 12, padding: '14px 8px', border: '1px solid #bae6fd' }}>
              <p style={{ margin: '0 0 4px', fontSize: 26, fontWeight: 900, color: '#0369a1' }}>{s.n}</p>
              <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CÓMO FUNCIONA */}
      <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#64748b', margin: '0 0 14px' }}>¿Cómo funciona?</h3>
      <div className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { step: '01', title: 'Reclutamos', desc: '25 testers reales verificados en México el mismo día que contratas.' },
          { step: '02', title: 'Monitoreamos', desc: 'Cada tester usa tu app mínimo 5 min al día. Sin entrada = sin pago.' },
          { step: '03', title: 'Aprobación', desc: '12+ testers activos por 14 días consecutivos = Google te aprueba.' },
        ].map((item, i) => (
          <div key={i} style={{ borderRadius: 14, padding: '20px 16px', background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 900, color: '#0369a1' }}>{item.step}</p>
            <p style={{ margin: '0 0 6px', fontSize: 14, fontWeight: 900, color: '#0f172a' }}>{item.title}</p>
            <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>{item.desc}</p>
          </div>
        ))}
      </div>

      {/* LO QUE INCLUYE */}
      <h3 style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#64748b', margin: '0 0 14px' }}>¿Qué incluye?</h3>
      <div style={{ marginBottom: 28 }}>
        {[
          '25 testers reclutados desde el día 1 con margen de seguridad incluido',
          'Testers humanos reales — nunca bots ni cuentas falsas, Google no los detecta',
          'Distribución geográfica en todo México (ciudades distintas)',
          'Sistema de incentivo por resultado: sin uso diario, sin pago al tester',
          'Monitoreo diario y reporte de avance compartido contigo',
          'Garantía: si no alcanzamos 12 activos en los 14 días, repetimos sin costo',
          'Acompañamiento hasta que Google apruebe tu acceso a producción',
        ].map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < 6 ? '1px solid #f1f5f9' : 'none' }}>
            <span style={{ color: '#0369a1', fontWeight: 900, fontSize: 16, flexShrink: 0, marginTop: 1 }}>✓</span>
            <span style={{ fontSize: 13, color: '#334155', lineHeight: 1.5 }}>{item}</span>
          </div>
        ))}
      </div>

      {/* INVERSIÓN */}
      <div className="price-box" style={{ borderRadius: 16, background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '28px 32px', marginBottom: 28, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
        <div>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#94a3b8' }}>Inversión total del servicio</p>
          <p style={{ margin: '0 0 4px', fontSize: 42, fontWeight: 900, fontStyle: 'italic', color: '#f97316' }}>$1,500 USD</p>
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Pago único · Sin comisiones posteriores</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#94a3b8' }}>Comparado con el mercado</p>
          <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: '#e2e8f0' }}>Agencias internacionales: $800–$2,500 USD</p>
          <p style={{ margin: 0, fontSize: 13, color: '#10b981', fontWeight: 700 }}>+ Testers reales en México ✓</p>
        </div>
      </div>

      {/* VENTAJAS COMPETITIVAS - SEGURIDAD */}
      <div style={{ background: '#fff7ed', border: '2px solid #fdba74', borderRadius: 16, padding: '24px', marginBottom: 28 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#c2410c' }}>
          🛡️ Garantía de Seguridad vs. Servicios Baratos
        </h3>
        <div className="safety-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ opacity: 0.6 }}>
            <p style={{ fontSize: 11, fontWeight: 900, color: '#991b1b', marginBottom: 8, textTransform: 'uppercase' }}>Servicios de $20–$100 USD</p>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: 12, color: '#7f1d1d' }}>
              <li style={{ marginBottom: 6 }}>❌ Bots y emuladores (Google los detecta)</li>
              <li style={{ marginBottom: 6 }}>❌ IPs de países de alto riesgo (Asia/África)</li>
              <li style={{ marginBottom: 6 }}>❌ Cuentas "granja" sin historial real</li>
              <li>❌ Riesgo de baneo permanente de tu cuenta</li>
            </ul>
          </div>
          <div>
            <p style={{ fontSize: 11, fontWeight: 900, color: '#166534', marginBottom: 8, textTransform: 'uppercase' }}>Nuestro Servicio Premium</p>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none', fontSize: 12, color: '#14532d' }}>
              <li style={{ marginBottom: 6 }}>✅ 100% Humanos Reales con dispositivos físicos</li>
              <li style={{ marginBottom: 6 }}>✅ IPs residenciales auténticas en México</li>
              <li style={{ marginBottom: 6 }}>✅ Actividad real diaria (navegación y clics)</li>
              <li>✅ Datos orgánicos que garantizan la aprobación</li>
            </ul>
          </div>
        </div>
      </div>

      {/* CONTACTO */}
      <div style={{ textAlign: 'center', padding: '20px 0 8px' }}>
        <p style={{ margin: '0 0 4px', fontSize: 13, color: '#64748b' }}>¿Listo para publicar tu app en Google Play?</p>
        <p style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 900, color: '#0369a1' }}>📲 WhatsApp: +52 1 [TU NÚMERO]</p>
        <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', marginTop: 16 }}>
          Prueba verificada con CarMatch Social — carmatchapp.net · México 2026
        </p>
      </div>
    </div>
  )
}
