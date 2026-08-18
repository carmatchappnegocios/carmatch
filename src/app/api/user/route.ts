// 🛡️ PROHIBIDO MODIFICAR SIN ORDEN EXPLÍCITA DEL USUARIO (Ver PROJECT_RULES.md)
// ⚠️ CRITICAL WARNING: FILE PROTECTED BY PROJECT RULES.
// DO NOT MODIFY THIS FILE WITHOUT EXPLICIT USER INSTRUCTION.

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { escapeHtml } from '@/lib/sanitize'

export async function PATCH(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
        }

        const data = await request.json()
        const { name, image, trustedContactId } = data

        if (!name && !image && trustedContactId === undefined) {
            return NextResponse.json({ error: 'No se proporcionaron datos para actualizar' }, { status: 400 })
        }

        // Buscar el usuario por email
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
        }

        // Actualizar usuario (sanitize name to prevent XSS)
        let updateData: Record<string, unknown> = {
            ...(name && { name: escapeHtml(name) }),
            ...(image && { image }),
        }

        // Validate image URL (only allow trusted domains or relative paths)
        if (image) {
            const allowedDomains = ['lh3.googleusercontent.com', 'pbs.twimg.com', 'platform-lookaside.fbsbx.com']
            const isRelativePath = image.startsWith('/')
            const isAllowedDomain = allowedDomains.some(domain => image.includes(domain))
            if (!isRelativePath && !isAllowedDomain) {
                return NextResponse.json({ error: 'URL de imagen no permitida' }, { status: 400 })
            }
        }

        // Validate trusted contact exists before setting
        if (trustedContactId !== undefined) {
            if (trustedContactId === "" || trustedContactId === null) {
                updateData.trustedContactId = null
                updateData.trustedContactAccepted = false
            } else {
                const contactExists = await prisma.user.findUnique({
                    where: { id: trustedContactId },
                    select: { id: true }
                })
                if (!contactExists) {
                    return NextResponse.json({ error: 'El contacto de confianza no existe' }, { status: 400 })
                }
                updateData.trustedContactId = trustedContactId
                updateData.trustedContactAccepted = false // Reset acceptance when changing contact
            }
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: updateData
        })

        return NextResponse.json({
            id: updatedUser.id,
            name: updatedUser.name,
            image: updatedUser.image,
            email: updatedUser.email
        })

    } catch (error) {
        console.error('Error actualizando perfil:', error)
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
    }
}
