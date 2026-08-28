const CLOUDFLARE_API_BASE = 'https://api.cloudflare.com/client/v4'

interface CloudflareConfig {
  apiToken: string
  zoneId: string
}

function getConfig(): CloudflareConfig {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN
  const zoneId = process.env.CLOUDFLARE_ZONE_ID

  if (!apiToken || !zoneId) {
    throw new Error('CLOUDFLARE_API_TOKEN y CLOUDFLARE_ZONE_ID son requeridos')
  }

  return { apiToken, zoneId }
}

async function cloudflareRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { apiToken, zoneId } = getConfig()
  const url = `${CLOUDFLARE_API_BASE}${endpoint.replace(':zone_id', zoneId)}`

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  const data = await response.json()

  if (!data.success) {
    const errors = data.errors?.map((e: any) => e.message).join(', ') || 'Error desconocido'
    throw new Error(`Cloudflare API Error: ${errors}`)
  }

  return data.result
}

export interface EmailRoutingRule {
  id: string
  name: string
  enabled: boolean
  matchers: Array<{
    type: 'literal' | 'all'
    field?: 'to'
    value: string
  }>
  actions: Array<{
    type: 'forward' | 'drop' | 'worker'
    value?: string[]
  }>
  priority: number
  created_on: string
  modified_on: string
}

export interface CreateRuleInput {
  name: string
  email: string
  destination: string
}

export async function listEmailRules(): Promise<EmailRoutingRule[]> {
  return cloudflareRequest<EmailRoutingRule[]>(`/zones/:zone_id/email/routing/rules`)
}

export async function createEmailRule(input: CreateRuleInput): Promise<EmailRoutingRule> {
  const { email, destination, name } = input
  const localPart = email.split('@')[0]

  return cloudflareRequest<EmailRoutingRule>(`/zones/:zone_id/email/routing/rules`, {
    method: 'POST',
    body: JSON.stringify({
      name,
      enabled: true,
      matchers: [
        {
          type: 'literal',
          field: 'to',
          value: email,
        },
      ],
      actions: [
        {
          type: 'forward',
          value: [destination],
        },
      ],
    }),
  })
}

export async function deleteEmailRule(ruleId: string): Promise<void> {
  await cloudflareRequest(`/zones/:zone_id/email/routing/rules/${ruleId}`, {
    method: 'DELETE',
  })
}

export async function getEmailRule(ruleId: string): Promise<EmailRoutingRule> {
  return cloudflareRequest<EmailRoutingRule>(`/zones/:zone_id/email/routing/rules/${ruleId}`)
}