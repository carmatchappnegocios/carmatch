// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { moderateUserContent } from '@/lib/ai/imageAnalyzer'
import { auth } from '@/lib/auth'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

// 🚀 CRITICAL: Aumentar tiempo de ejecución para subidas pesadas/lentas
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    const session = await auth()

    // 🛡️ SECURITY FIX: Solo usuarios logueados pueden subir imágenes
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Debes iniciar sesión para subir imágenes' }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null
        const imageType = formData.get('imageType') as string || 'vehicle' // 'vehicle', 'profile', 'business'

        if (!file) {
            console.error('❌ No se recibió archivo')
            return NextResponse.json(
                { error: 'No se recibió ningún archivo' },
                { status: 400 }
            )
        }

        // File size limit: 10MB
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'El archivo es demasiado grande (máximo 10MB)' },
                { status: 400 }
            )
        }

        // Debug Cloud Config (Log bools only for security)
        const configCheck = {
            cloud_name: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            api_key: !!process.env.CLOUDINARY_API_KEY,
            api_secret: !!process.env.CLOUDINARY_API_SECRET
        }

        if (!configCheck.cloud_name || !configCheck.api_key || !configCheck.api_secret) {
            console.error('❌ Faltan credenciales en .env')
            return NextResponse.json(
                { error: 'Error de configuración del servidor' },
                { status: 500 }
            )
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // 🛡️ MODERACIÓN DE CONTENIDO (Solo para Perfil y Negocios)
        if (imageType === 'profile' || imageType === 'business') {
            const base64Image = buffer.toString('base64');
            const moderationResult = await moderateUserContent(base64Image);

            if (!moderationResult.isAppropriate) {
                console.warn(`⛔ Imagen bloqueada: ${moderationResult.reason}`);
                return NextResponse.json(
                    {
                        error: 'Imagen rechazada por moderación',
                        reason: moderationResult.reason,
                        category: moderationResult.category
                    },
                    { status: 400 }
                );
            }
        }

        // Upload to Cloudinary using a Promise wrapper
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'carmatch/vehicles',
                    resource_type: 'image',
                },
                (error, result) => {
                    if (error) {
                        console.error('❌ Error Callback Cloudinary:', error)
                        reject(error)
                    }
                    else {
                        resolve(result)
                    }
                }
            )

            uploadStream.on('error', (err) => {
                console.error('❌ Error Stream:', err)
                reject(err)
            })

            uploadStream.end(buffer)
        })

        return NextResponse.json(result)

    } catch (error) {
        console.error('💥 ERROR DE SERVIDOR:', error)
        return NextResponse.json(
            { error: 'Error al subir la imagen' },
            { status: 500 }
        )
    }
}
