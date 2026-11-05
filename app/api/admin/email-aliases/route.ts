import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  listEmailRules,
  createEmailRule,
  deleteEmailRule,
} from '@/lib/cloudflare-email'

const FORWARD_DESTINATION = process.env.CLOUDFLARE_EMAIL_DESTINATION || 'carmatch.negocios@gmail.com'
const DOMAIN = 'carmatchapp.net'

function isAdminSession(session: any): boolean {
  if (!session?.user) return false
  // Check session admin flag set by NextAuth callbacks
  if (session.user.isAdmin) return true
  // Fallback to email match (case-insensitive)
  const email = session.user.email
  const adminEmail = process.env.ADMIN_EMAIL
  if (email && adminEmail) {
    return email.toLowerCase() === adminEmail.toLowerCase()
  }
  return false
}

export async function GET() {
  const session = await auth()

  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const rules = await listEmailRules()
    const aliases = rules
      .filter((rule) => {
        const matcher = rule.matchers.find((m) => m.field === 'to' && typeof m.value === 'string')
        if (!matcher) return false
        const value = matcher.value
        // Exclude wildcards / catch-all and ensure exact domain
        if (value.includes('*')) return false
        return value.endsWith(`@${DOMAIN}`)
      })
      .map((rule) => {
        const matcher = rule.matchers.find((m) => m.field === 'to')
        const email = matcher?.value || ''
        return {
          id: rule.id,
          email,
          name: rule.name,
          enabled: rule.enabled,
          createdAt: rule.created_on,
        }
      })

    return NextResponse.json({ aliases, catchAllActive: true, destination: FORWARD_DESTINATION })
  } catch (error) {
    console.error('Error listing email aliases:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al listar aliases' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { localPart, name } = body

    if (!localPart || typeof localPart !== 'string') {
      return NextResponse.json({ error: 'localPart es requerido' }, { status: 400 })
    }

    const sanitized = localPart.toLowerCase().replace(/[^a-z0-9._-]/g, '')
    if (!sanitized) {
      return NextResponse.json({ error: 'localPart inválido' }, { status: 400 })
    }

    const email = `${sanitized}@${DOMAIN}`
    const ruleName = name || `Alias: ${email}`

    const rule = await createEmailRule({
      email,
      destination: FORWARD_DESTINATION,
      name: ruleName,
    })

    return NextResponse.json({
      id: rule.id,
      email: rule.matchers.find((m) => m.field === 'to')?.value || email,
      name: rule.name,
      enabled: rule.enabled,
      createdAt: rule.created_on,
    })
  } catch (error) {
    console.error('Error creating email alias:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al crear alias' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()

  if (!isAdminSession(session)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const ruleId = searchParams.get('id')

    if (!ruleId) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 })
    }

    await deleteEmailRule(ruleId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting email alias:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al eliminar alias' },
      { status: 500 }
    )
  }
}