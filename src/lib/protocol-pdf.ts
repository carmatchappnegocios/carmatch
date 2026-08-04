export function renderProtocolPDF(
  data: any,
  topic: string
) {
  const d = data;
  const color = d.accent_color || '#ff0000';
  const googleFonts = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Inter:wght@900&display=swap'
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://carmatchapp.net'

  const css = `
*{margin:0;padding:0;box-sizing:border-box}
body{
    font-family:'JetBrains Mono',monospace;
    background:#050505;
    color:#ffffff;
    padding:40px;
    max-width:800px;
    margin:0 auto;
    border-left: 1px solid #111;
    border-right: 1px solid #111;
}
.classified-stamp{
    position:fixed;
    top:40px;
    right:40px;
    border:3px solid ${color};
    color:${color};
    padding:10px 20px;
    font-weight:800;
    text-transform:uppercase;
    transform:rotate(15deg);
    opacity:0.6;
    font-size:14px;
}
.header{
    border-bottom:1px solid #222;
    padding-bottom:20px;
    margin-bottom:40px;
}
.protocol-id{color:${color}; font-size:10px; letter-spacing:3px; font-weight:800;}
.title{font-size:32px; font-weight:800; text-transform:uppercase; margin-top:10px; line-height:1;}

.briefing-box{
    background:#0a0a0a;
    border:1px solid #1a1a1a;
    padding:25px;
    margin-bottom:30px;
    position:relative;
}
.label{font-size:9px; color:${color}; text-transform:uppercase; letter-spacing:2px; margin-bottom:10px; display:block;}
.text{font-size:12px; color:#ccc; line-height:1.6;}

.story-grid{
    display:grid;
    grid-template-columns: 1fr;
    gap:15px;
    margin-top:30px;
}
.step{
    border-left: 2px solid #111;
    padding-left:20px;
    margin-bottom:20px;
    page-break-inside: avoid;
}
.step-num{font-size:24px; font-weight:800; color:#1a1a1a; margin-bottom:5px;}

.strategy-grid{
    display:grid;
    grid-template-columns: 1fr 1fr;
    gap:10px;
    margin-top:40px;
}
.strat-card{
    background:#080808;
    border:1px solid #111;
    padding:15px;
    page-break-inside: avoid;
}

.footer{
    margin-top:60px;
    font-size:8px;
    color:#222;
    text-align:center;
    letter-spacing:5px;
}
`

  const html = [
    '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">',
    '<title>PROTOCOL_' + d.protocol_title + '</title>',
    '<link href="' + googleFonts + '" rel="stylesheet">',
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>',
    '<style>' + css + '</style></head><body>',
    '<div class="classified-stamp">CONFIDENCIAL</div>',
    '<div id="pdf-content">',
    '<div class="header">',
    '<div class="protocol-id">CARMATCH PROTOCOL // ' + d.protocol_title + '</div>',
    '<h1 class="title">' + topic + '</h1>',
    '</div>',

    '<div class="briefing-box">',
    '<span class="label">EL DISPARADOR (HOOK)</span>',
    '<p style="font-size:18px; font-weight:800; color:' + color + '">\u201c' + d.leaked_hook + '\u201d</p>',
    '</div>',

    '<div class="briefing-box">',
    '<span class="label">PROTOCOLO DE BRIEFING</span>',
    '<p class="text">' + d.protocol_briefing + '</p>',
    '</div>',

    '<div style="margin-top:40px;">',
    '<span class="label">STORYBOARD DE FILTRACIÓN</span>',
    '<div class="story-grid">',
    d.storyboard.map((s: any, i: number) => `
        <div class="step">
            <div class="step-num">${String(i + 1).padStart(2, '0')}</div>
            <p class="text" style="font-weight:700; color:#fff;">TOMA: ${s.visual}</p>
            <p class="text" style="color:${color}; margin-top:5px;">OVERLAY: ${s.overlay}</p>
            <p class="text" style="font-size:10px; opacity:0.6; margin-top:5px;">AUDIO: ${s.audio}</p>
        </div>
    `).join(''),
    '</div>',
    '</div>',

    '<div class="strategy-grid">',
    Object.entries(d.platforms).map(([k, v]: any) => `
        <div class="strat-card">
            <span class="label">${k.toUpperCase()}</span>
            <p class="text" style="font-size:10px;">${v}</p>
        </div>
    `).join(''),
    '</div>',

    '<div style="margin-top:40px; padding:20px; border:1px dashed #333;">',
    '<span class="label">MISIÓN HÉROE (SOS)</span>',
    '<p class="text">' + d.hero_mission + '</p>',
    '</div>',

    '<div class="footer">CARMATCH SOCIAL // UNICORN STATUS PENDING // NO DISTRIBUTE</div>',
    '</div>',

    '<script>',
    'window.onload = function() {',
    '  setTimeout(function() {',
    '    var element = document.getElementById("pdf-content");',
    '    var opt = {',
    '      margin: 15,',
    '      filename: "PROTOCOL_' + d.protocol_title + '.pdf",',
    '      html2canvas: { scale: 3, backgroundColor: "#050505" },',
    '      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },',
    '      pagebreak: { mode: "css" }',
    '    };',
    '    html2pdf().set(opt).from(element).save().then(function() {',
    '      setTimeout(function() { window.close(); }, 1000);',
    '    });',
    '  }, 1000);',
    '}',
    '</script></body></html>'
  ].join('\n')

  const win = window.open('', '_blank', 'width=1000,height=900')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}
