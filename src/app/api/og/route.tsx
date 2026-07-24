import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract useful fields
    const title = searchParams.get('title') || 'CarMatch Social';
    const text = searchParams.get('text') || 'Mantén tu pasión al máximo.';
    const type = searchParams.get('type') || 'tip'; // 'tip', 'trivia', 'question'
    const zone = (searchParams.get('zone') || 'CENTER').toUpperCase();
    const bgUrl = searchParams.get('bg');

    // Determine colors
    const isTrivia = type === 'trivia';
    const bgColor = isTrivia ? '#000000' : '#ffffff';
    const textColor = isTrivia ? '#ffffff' : '#000000';
    const accentColor = '#ee3338'; // CarMatch Red
    const accentColor2 = '#23297a'; // CarMatch Blue

    // Zone logic
    let contentJustify = 'center';
    let contentPaddingTop = '40px';
    if (zone === 'TOP') { contentJustify = 'flex-start'; contentPaddingTop = '180px'; }
    if (zone === 'BOTTOM') { contentJustify = 'flex-end'; contentPaddingTop = '40px'; }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: contentJustify,
            backgroundColor: bgColor,
            padding: '60px',
            paddingTop: contentPaddingTop,
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Background Image Layer */}
          {bgUrl && (
            <img
              src={bgUrl}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: 0.8, // Subtle transparency to blend with background color if needed
              }}
            />
          )}

          {/* Semi-transparent overlay for better text readability if background exists */}
          {bgUrl && (
              <div 
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: isTrivia ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.2)',
                    zIndex: 1,
                }}
              />
          )}
          {/* Logo Handle / Branding Top */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'absolute',
              top: '60px',
              left: '60px',
              zIndex: 10,
            }}
          >
            <div style={{ color: accentColor, fontSize: 32, fontWeight: 900, marginRight: 8 }}>CarMatch</div>
            <div style={{ color: isTrivia ? '#ffffff' : accentColor2, fontSize: 32, fontWeight: 300 }}>Social</div>
          </div>

          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: '60px',
              right: '60px',
              padding: '10px 20px',
              background: isTrivia ? '#222' : '#f0f0f0',
              borderRadius: '20px',
              color: isTrivia ? '#aaa' : '#666',
              fontSize: 24,
              fontWeight: 600,
              textTransform: 'uppercase',
              zIndex: 10,
            }}
          >
            {type}
          </div>

          {/* Main Title Box */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              width: '100%',
              marginBottom: zone === 'BOTTOM' ? '180px' : '40px',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <h1
              style={{
                fontSize: 72,
                fontWeight: 900,
                color: textColor,
                marginBottom: 20,
                lineHeight: 1.1,
                maxWidth: '900px',
                textWrap: 'balance',
              }}
            >
              {title}
            </h1>
            
            {text !== 'null' && text !== title && (
              <p
                style={{
                  fontSize: 48,
                  fontWeight: 400,
                  color: isTrivia ? '#cccccc' : '#555555',
                  maxWidth: '850px',
                  lineHeight: 1.3,
                  marginTop: 20,
                  textWrap: 'balance',
                }}
              >
                {text}
              </p>
            )}
          </div>

          {/* Footer UI */}
          <div
             style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                bottom: '60px',
                width: '100%',
             }}
          >
              <div 
                style={{
                  background: `linear-gradient(90deg, ${accentColor}, ${accentColor2})`,
                  color: 'white',
                  padding: '15px 40px',
                  borderRadius: '30px',
                  fontSize: 28,
                  fontWeight: 700,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                }}
              >
                Compra, vende y descubre en carmatchapp.net
              </div>
          </div>
          
          {/* Decorative Elements */}
          <div style={{ position: 'absolute', bottom: -100, left: -100, width: 300, height: 300, background: accentColor, borderRadius: '50%', filter: 'blur(150px)', opacity: 0.3 }}></div>
          <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, background: accentColor2, borderRadius: '50%', filter: 'blur(150px)', opacity: 0.2 }}></div>

        </div>
      ),
      {
        width: 1080,
        height: 1080, // Square default (Instagram size)
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
