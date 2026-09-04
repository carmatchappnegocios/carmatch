import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'CarMatch <noreply@carmatchapp.net>'
const BASE_URL = process.env.NEXTAUTH_URL || 'https://carmatchapp.net'
const LOGO_URL = `${BASE_URL}/icon-512-v20.png`

const emailWrapper = (content: string) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background: #0f172a;">
        <div style="text-align: center; padding: 30px 20px 10px;">
            <img src="${LOGO_URL}" alt="CarMatch" width="64" height="64" style="border-radius: 16px;" />
        </div>
        ${content}
        <div style="text-align: center; padding: 20px; border-top: 1px solid #1e293b;">
            <p style="color: #475569; font-size: 12px; margin: 0;">
                CarMatch - La red social automotriz #1 de México
            </p>
            <p style="color: #475569; font-size: 11px; margin: 4px 0 0;">
                <a href="${BASE_URL}/settings" style="color: #64748b; text-decoration: underline;">Gestionar notificaciones</a>
            </p>
        </div>
    </div>
`

export async function sendWelcomeEmail(email: string, name: string) {
    try {
        await resend.emails.send({
            from: FROM,
            to: email,
            subject: 'Bienvenido a CarMatch - Tu red social automotriz',
            html: emailWrapper(`
                <div style="padding: 20px 30px; color: #e2e8f0;">
                    <h1 style="color: #f97316; font-size: 24px; margin-bottom: 8px;">¡Bienvenido, ${name}! 🚗</h1>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
                        Gracias por unirte a la red social automotriz más grande. Aquí puedes comprar, vender y conectar con todo lo relacionado con autos.
                    </p>

                    <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <h2 style="color: #0ea5e9; font-size: 18px; margin-bottom: 12px;">¿Qué puedes hacer en CarMatch?</h2>
                        <ul style="color: #cbd5e1; line-height: 2.2; padding-left: 20px; margin: 0;">
                            <li><strong style="color: #f97316;">Publica tu vehículo gratis</strong> y llega a miles de compradores en tu ciudad</li>
                            <li><strong style="color: #f97316;">Explora el marketplace</strong> con búsqueda inteligente por marca, modelo, precio y ubicación</li>
                            <li><strong style="color: #f97316;">Encuentra talleres y servicios</strong> mecánicos, grúas, refacciones y más en el mapa</li>
                            <li><strong style="color: #f97316;">Chatea directamente</strong> con vendedores y compradores al instante</li>
                            <li><strong style="color: #f97316;">Agenda citas seguras</strong> con nuestro sistema de monitoreo GPS y botón SOS</li>
                        </ul>
                    </div>

                    <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <h2 style="color: #22c55e; font-size: 18px; margin-bottom: 12px;">🛡️ Seguridad primero</h2>
                        <p style="color: #cbd5e1; line-height: 1.6; margin: 0;">
                            Tu seguridad es nuestra prioridad. Contamos con <strong>rastreo GPS en tiempo real</strong>, <strong>botón de emergencia SOS</strong> y <strong>verificación de identidad</strong> para que compres y vendas con total confianza.
                        </p>
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${BASE_URL}/market" style="display: inline-block; background: #f97316; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                            Explorar Marketplace
                        </a>
                    </div>

                    <p style="color: #64748b; font-size: 13px; text-align: center;">
                        ¿Tienes dudas? Responde a este correo y te ayudamos.
                    </p>
                </div>
            `),
        })
    } catch (error) {
        console.error('[EMAIL_WELCOME] Error:', error)
    }
}

export async function sendVehicleExpiringEmail(
    email: string,
    name: string,
    vehicleTitle: string,
    vehicleId: string,
    hasCredits: boolean,
    credits: number
) {
    try {
        const renewUrl = hasCredits ? `${BASE_URL}/vehicle/${vehicleId}` : `${BASE_URL}/profile?tab=credits`

        await resend.emails.send({
            from: FROM,
            to: email,
            subject: `⏰ Tu vehículo "${vehicleTitle}" expira pronto`,
            html: emailWrapper(`
                <div style="padding: 20px 30px; color: #e2e8f0;">
                    <h1 style="color: #f97316; font-size: 22px; margin-bottom: 8px;">⏰ Tu vehículo expira en 2 días</h1>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
                        Hola ${name}, tu anuncio <strong>"${vehicleTitle}"</strong> expira en 2 días.
                    </p>

                    <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        ${hasCredits ? `
                            <p style="color: #22c55e; font-size: 16px; line-height: 1.6; margin: 0;">
                                ✅ Tienes <strong>${credits} crédito(s)</strong> disponible(s). Tu vehículo se renovará automáticamente por 30 días más. Se descontará 1 crédito.
                            </p>
                        ` : `
                            <p style="color: #ef4444; font-size: 16px; line-height: 1.6; margin: 0;">
                                ❌ No tienes créditos. Si no renuevas, tu anuncio será desactivado y no aparecerá en el marketplace.
                            </p>
                        `}
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${renewUrl}" style="display: inline-block; background: #f97316; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                            ${hasCredits ? 'Ver mi vehículo' : 'Comprar créditos'}
                        </a>
                    </div>
                </div>
            `),
        })
    } catch (error) {
        console.error('[EMAIL_VEHICLE_EXPIRING] Error:', error)
    }
}

export async function sendBusinessExpiringEmail(
    email: string,
    name: string,
    businessName: string,
    businessId: string,
    hasCredits: boolean,
    credits: number
) {
    try {
        const renewUrl = hasCredits ? `${BASE_URL}/my-businesses?businessId=${businessId}` : `${BASE_URL}/profile?tab=credits`

        await resend.emails.send({
            from: FROM,
            to: email,
            subject: `⏰ Tu negocio "${businessName}" expira pronto`,
            html: emailWrapper(`
                <div style="padding: 20px 30px; color: #e2e8f0;">
                    <h1 style="color: #f97316; font-size: 22px; margin-bottom: 8px;">⏰ Tu negocio expira en 2 días</h1>
                    <p style="color: #94a3b8; font-size: 16px; line-height: 1.6;">
                        Hola ${name}, tu negocio <strong>"${businessName}"</strong> expira en 2 días.
                    </p>

                    <div style="background: #1e293b; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        ${hasCredits ? `
                            <p style="color: #22c55e; font-size: 16px; line-height: 1.6; margin: 0;">
                                ✅ Tienes <strong>${credits} crédito(s)</strong> disponible(s). Tu negocio se renovará automáticamente por 30 días más. Se descontará 1 crédito.
                            </p>
                        ` : `
                            <p style="color: #ef4444; font-size: 16px; line-height: 1.6; margin: 0;">
                                ❌ No tienes créditos. Si no renuevas, tu negocio será desactivado y no aparecerá en el directorio.
                            </p>
                        `}
                    </div>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${renewUrl}" style="display: inline-block; background: #f97316; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                            ${hasCredits ? 'Ver mi negocio' : 'Comprar créditos'}
                        </a>
                    </div>
                </div>
            `),
        })
    } catch (error) {
        console.error('[EMAIL_BUSINESS_EXPIRING] Error:', error)
    }
}
