/**
 * 🎬 CarMatch Viral Storyboard Generator
 * Dark Mode, High-Impact, Visual-First Script.
 * Designed for viral video production and AI Video Generator parsing.
 */

export interface StoryboardStep {
  visual: string
  overlay: string
  audio: string
}

export interface DocumentaryData {
  personaje?: string
  gancho?: string
  hook_visual?: string
  storyboard?: StoryboardStep[]
  layout_style?: 'GRID' | 'LIST' | 'CINEMATIC'
  accent_color?: string
  stat1_num?: string
  stat1_txt?: string
  stat2_num?: string
  stat2_txt?: string
  stat3_num?: string
  stat3_txt?: string
  reflexion?: string
  cta?: string
}

export function renderDocumentaryPDF(
  data: any,
  title: string,
  reasonNumber: number
) {
  const d = {
    personaje: data.personaje || 'Usuario de CarMatch',
    gancho: data.gancho_maestro || data.gancho || 'La revolución de CarMatch',
    storyboard: Array.isArray(data.storyboard) ? data.storyboard : [],
    layout: data.layout_style || 'GRID',
    color: data.accent_color || '#f97316',
    estrategias: {
        tiktok: data.estrategia_tiktok || 'N/A',
        kwai: data.estrategia_kwai || 'N/A',
        youtube: data.estrategia_youtube || 'N/A',
        x: data.estrategia_x || 'N/A',
        meta: data.estrategia_meta || 'N/A'
    },
    reflexion: data.reflexion || 'CarMatch cambia las reglas del juego.',
    cta: data.cta || 'Descarga CarMatch ahora.'
  }

  const numStr = String(reasonNumber)
  const googleFonts = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=JetBrains+Mono:wght@400;700&display=swap'
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://carmatchapp.net'

  const css = `
*{margin:0;padding:0;box-sizing:border-box}
body{
    font-family:'Inter',sans-serif;
    background:#000000;
    color:#ffffff;
    line-height:1.4;
    padding:30px;
    max-width:850px;
    margin:0 auto;
    word-wrap: break-word;
    overflow-wrap: break-word;
}
.mono{font-family:'JetBrains Mono',monospace}

#pdf-content > * {
    page-break-inside: avoid;
    break-inside: avoid;
    margin-bottom: 20px;
}

.header{
    border-bottom:2px solid ${d.color};
    padding-bottom:15px;
    margin-bottom:25px;
    display:flex;
    justify-content:space-between;
    align-items:flex-end;
}
.brand{
    font-size:9px;
    font-weight:900;
    letter-spacing:2px;
    text-transform:uppercase;
    color:${d.color};
}
.title{
    font-size:26px;
    font-weight:900;
    line-height:1.1;
    text-transform:uppercase;
    margin:8px 0;
}

.hook-section{
    background:linear-gradient(90deg, ${d.color}, #fb923c);
    color:#000;
    padding:18px;
    border-radius:10px;
    margin-bottom:25px;
}
.hook-label{font-size:9px; font-weight:900; text-transform:uppercase; opacity:0.7;}
.hook-text{font-size:18px; font-weight:900; margin-top:5px; word-wrap: break-word;}

.storyboard-grid{
    display:grid;
    grid-template-columns: ${d.layout === 'GRID' ? '1fr 1fr' : '1fr'};
    gap:12px;
    margin-bottom:30px;
}
.step-card{
    background:#111;
    border:1px solid #222;
    padding:15px;
    border-radius:10px;
    display:grid;
    grid-template-columns: ${d.layout === 'CINEMATIC' ? '1fr' : '40px 1fr'};
    gap:12px;
    overflow: hidden;
}
.step-num{
    font-size:24px;
    font-weight:900;
    color:#333;
    line-height:1;
}
.step-content{display:grid; grid-template-columns:1fr; gap:8px;}
.step-label{font-size:7px; font-weight:900; text-transform:uppercase; color:${d.color}; margin-bottom:2px; display:block;}
.step-text{font-size:10px; color:#ccc; word-wrap: break-word;}
.overlay-text{font-family:'JetBrains Mono',monospace; color:#fff; font-weight:700; background:#222; padding:4px; border-radius:4px; font-size:10px; word-wrap: break-word;}

.strategy-box{
    border:1px solid #222;
    background:#080808;
    border-radius:12px;
    padding:20px;
    margin-top:30px;
}
.strategy-item{margin-bottom:15px; padding-bottom:15px; border-bottom:1px solid #111;}
.strategy-item:last-child{border:0; margin:0; padding:0;}
.plat-label{font-size:8px; font-weight:900; color:${d.color}; text-transform:uppercase; letter-spacing:1px; margin-bottom:5px; display:block;}
.plat-text{font-size:10px; color:#ccc; line-height:1.5;}

.footer{
    margin-top:40px;
    border-top:1px solid #222;
    padding-top:15px;
    font-size:8px;
    color:#444;
    text-align:center;
}
`

  const html = [
    '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">',
    '<title>MASTER VIRAL #' + numStr + '</title>',
    '<base href="' + origin + '/">',
    '<link href="' + googleFonts + '" rel="stylesheet">',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>',
    '<style>' + css + '</style></head><body>',
    '<div id="pdf-content">',

    // HEADER
    '<div class="header">',
    '<div>',
    '<div class="brand">MASTER VIRAL STORYBOARD \u2014 STYLE: ' + d.layout + '</div>',
    '<h1 class="title">Raz\u00f3n #' + numStr + ': ' + title + '</h1>',
    '<div style="font-size:12px; color:#888;">Perfil: ' + d.personaje + '</div>',
    '</div>',
    '<img src="icon-512-v20-fixed.png" crossorigin="anonymous" style="height:40px; width:auto; filter:brightness(1.5);" />',
    '</div>',

    // HOOK
    '<div class="hook-section">',
    '<div class="hook-label">EL DISPARADOR (HOOK MAESTRO)</div>',
    '<div class="hook-text">\u201c' + d.gancho + '\u201d</div>',
    '</div>',

    // STORYBOARD
    '<div class="storyboard-grid">',
    d.storyboard.map((step: any, index: number) => `
        <div class="step-card">
            <div class="step-num mono">${index + 1}</div>
            <div class="step-content">
                <div>
                    <span class="step-label">Toma Cinematogr\u00e1fica</span>
                    <p class="step-text">${step.visual || '...'}</p>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; border-top:1px solid #222; padding-top:8px; margin-top:5px;">
                    <div>
                        <span class="step-label">Overlay (Texto Pantalla)</span>
                        <p class="overlay-text">${step.overlay || '...'}</p>
                    </div>
                    <div>
                        <span class="step-label">Audio / SFX</span>
                        <p class="step-text mono" style="color:${d.color}; font-size:10px;">${step.audio || '...'}</p>
                    </div>
                </div>
            </div>
        </div>
    `).join(''),
    '</div>',

    // ESTRATEGIAS
    '<div class="strategy-box">',
    '<div class="brand" style="margin-bottom:15px; color:#fff;">Plan de Incursi\u00f3n en Redes</div>',
    '<div class="strategy-item"><span class="plat-label">TikTok (Hacking Retenci\u00f3n)</span><p class="plat-text">' + d.estrategias.tiktok + '</p></div>',
    '<div class="strategy-item"><span class="plat-label">Kwai (Drama Humano)</span><p class="plat-text">' + d.estrategias.kwai + '</p></div>',
    '<div class="strategy-item"><span class="plat-label">YouTube (Autoridad/Datos)</span><p class="plat-text">' + d.estrategias.youtube + '</p></div>',
    '<div class="strategy-item"><span class="plat-label">X / Twitter (Conflicto/Pol\u00e9mica)</span><p class="plat-text">' + d.estrategias.x + '</p></div>',
    '<div class="strategy-item"><span class="plat-label">Meta (Estatus/Aspiración)</span><p class="plat-text">' + d.estrategias.meta + '</p></div>',
    '</div>',

    // CIERRE
    '<div style="margin-top:40px; padding:30px; border:2px solid ' + d.color + '; border-radius:16px; overflow: hidden;">',
    '<div class="brand" style="color:#fff; margin-bottom:10px;">Cierre Viral</div>',
    '<p style="font-size:18px; font-weight:800; word-wrap: break-word;">' + d.reflexion + '</p>',
    '<p style="font-size:12px; color:' + d.color + '; margin-top:15px; font-weight:900; word-wrap: break-word;">CTA: ' + d.cta + '</p>',
    '</div>',

    '<div class="footer">ESTRATEGIA EXCLUSIVA CARMATCH SOCIAL \u2014 PRO GAMER MODE ACTIVATED</div>',
    '</div>',

    '<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:#000;display:flex;align-items:center;justify-content:center;z-index:9999;font-family:sans-serif;font-weight:bold;color:#fff;">Compilando Storyboard: ' + d.layout + '...</div>',
    '<script>',
    'window.onload = function() {',
    '  setTimeout(function() {',
    '    var element = document.getElementById("pdf-content");',
    '    var opt = {',
    '      margin: [10, 10, 10, 10],',
    '      filename: "Storyboard_' + d.layout + '_Razon_' + reasonNumber + '.pdf",',
    '      image: { type: "jpeg", quality: 1.0 },',
    '      html2canvas: { scale: 3, useCORS: true, allowTaint: true, backgroundColor: "#000000" },',
    '      jsPDF: { unit: "mm", format: "a4", orientation: "portrait", compress: true },',
    '      pagebreak: { mode: "css" }',
    '    };',
    '    html2pdf().set(opt).from(element).save().then(function() {',
    '      setTimeout(function() { window.close(); }, 1500);',
    '    });',
    '  }, 1000);',
    '}',
    '</script>',
    '</body></html>'
  ].join('\n')

  const win = window.open('', '_blank', 'width=1000,height=900')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}
