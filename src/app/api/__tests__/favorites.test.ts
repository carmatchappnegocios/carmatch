import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    favorite: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/lib/realNotifications', () => ({
  notifyRealFavorite: vi.fn(),
}))

function makePostRequest(body: any) {
  return new Request('http://localhost/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/favorites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    const { auth } = await import('@/lib/auth')
    vi.mocked(auth).mockResolvedValue(null as any)

    const { POST } = await import('@/api/favorites/route')
    const req = makePostRequest({ vehicleId: 'v1' })
    const res = await POST(req as any)
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error).toBe('No autorizado')
  })

  it('returns 400 when vehicleId is missing', async () => {
    const { auth } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/db')

    vi.mocked(auth).mockResolvedValue({ user: { email: 'test@test.com' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1' } as any)

    const { POST } = await import('@/api/favorites/route')
    const req = makePostRequest({})
    const res = await POST(req as any)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toBe('Vehicle ID requerido')
  })

  it('returns 400 when action is invalid', async () => {
    const { auth } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/db')

    vi.mocked(auth).mockResolvedValue({ user: { email: 'test@test.com' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1' } as any)

    const { POST } = await import('@/api/favorites/route')
    const req = makePostRequest({ vehicleId: 'v1', action: 'invalid' })
    const res = await POST(req as any)
    const json = await res.json()

    expect(res.status).toBe(400)
    expect(json.error).toContain('Acción no válida')
  })

  it('returns 404 when user not found', async () => {
    const { auth } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/db')

    vi.mocked(auth).mockResolvedValue({ user: { email: 'test@test.com' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null)

    const { POST } = await import('@/api/favorites/route')
    const req = makePostRequest({ vehicleId: 'v1' })
    const res = await POST(req as any)
    const json = await res.json()

    expect(res.status).toBe(404)
    expect(json.error).toBe('Usuario no encontrado')
  })

  it('toggle action adds favorite when not exists', async () => {
    const { auth } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/db')
    const { notifyRealFavorite } = await import('@/lib/realNotifications')

    vi.mocked(auth).mockResolvedValue({ user: { email: 'test@test.com' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1' } as any)
    vi.mocked(prisma.favorite.create).mockResolvedValue({} as any)
    vi.mocked(notifyRealFavorite).mockResolvedValue(undefined as any)

    const { POST } = await import('@/api/favorites/route')
    const req = makePostRequest({ vehicleId: 'v1', action: 'toggle' })
    const res = await POST(req as any)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.isFavorited).toBe(true)
    expect(json.message).toBe('Agregado a favoritos')
    expect(prisma.favorite.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', vehicleId: 'v1' },
    })
  })

  it('toggle action removes favorite when already exists', async () => {
    const { auth } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/db')

    vi.mocked(auth).mockResolvedValue({ user: { email: 'test@test.com' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1' } as any)

    const uniqueError = new Error('Unique constraint violation')
    vi.mocked(prisma.favorite.create).mockRejectedValue(uniqueError)
    vi.mocked(prisma.favorite.deleteMany).mockResolvedValue({ count: 1 } as any)

    const { POST } = await import('@/api/favorites/route')
    const req = makePostRequest({ vehicleId: 'v1', action: 'toggle' })
    const res = await POST(req as any)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.isFavorited).toBe(false)
    expect(json.message).toBe('Eliminado de favoritos')
    expect(prisma.favorite.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', vehicleId: 'v1' },
    })
  })

  it('add action is idempotent when already favorited', async () => {
    const { auth } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/db')

    vi.mocked(auth).mockResolvedValue({ user: { email: 'test@test.com' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1' } as any)

    const uniqueError = new Error('Unique constraint violation')
    vi.mocked(prisma.favorite.create).mockRejectedValue(uniqueError)

    const { POST } = await import('@/api/favorites/route')
    const req = makePostRequest({ vehicleId: 'v1', action: 'add' })
    const res = await POST(req as any)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.isFavorited).toBe(true)
    expect(json.message).toBe('Ya está en favoritos')
  })

  it('remove action deletes favorite', async () => {
    const { auth } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/db')

    vi.mocked(auth).mockResolvedValue({ user: { email: 'test@test.com' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1' } as any)
    vi.mocked(prisma.favorite.deleteMany).mockResolvedValue({ count: 1 } as any)

    const { POST } = await import('@/api/favorites/route')
    const req = makePostRequest({ vehicleId: 'v1', action: 'remove' })
    const res = await POST(req as any)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.isFavorited).toBe(false)
    expect(json.message).toBe('Eliminado de favoritos')
  })

  it('remove action returns appropriate message when not favorited', async () => {
    const { auth } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/db')

    vi.mocked(auth).mockResolvedValue({ user: { email: 'test@test.com' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1' } as any)
    vi.mocked(prisma.favorite.deleteMany).mockResolvedValue({ count: 0 } as any)

    const { POST } = await import('@/api/favorites/route')
    const req = makePostRequest({ vehicleId: 'v1', action: 'remove' })
    const res = await POST(req as any)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.isFavorited).toBe(false)
    expect(json.message).toBe('No estaba en favoritos')
  })

  it('returns 500 on database error', async () => {
    const { auth } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/db')

    vi.mocked(auth).mockResolvedValue({ user: { email: 'test@test.com' } } as any)
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('DB down'))

    const { POST } = await import('@/api/favorites/route')
    const req = makePostRequest({ vehicleId: 'v1' })
    const res = await POST(req as any)

    expect(res.status).toBe(500)
  })
})

describe('GET /api/favorites', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when not authenticated', async () => {
    const { auth } = await import('@/lib/auth')
    vi.mocked(auth).mockResolvedValue(null as any)

    const { GET } = await import('@/api/favorites/route')
    const req = new Request('http://localhost/api/favorites')
    const res = await GET(req as any)
    const json = await res.json()

    expect(res.status).toBe(401)
    expect(json.error).toBe('No autorizado')
  })

  it('returns favorites list for authenticated user', async () => {
    const { auth } = await import('@/lib/auth')
    const { prisma } = await import('@/lib/db')

    vi.mocked(auth).mockResolvedValue({ user: { email: 'test@test.com' } } as any)
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'user-1' } as any)
    vi.mocked(prisma.favorite.findMany).mockResolvedValue([
      {
        vehicle: { id: 'v1', title: 'Toyota Tacoma' },
        createdAt: new Date('2024-01-01'),
      },
    ] as any)

    const { GET } = await import('@/api/favorites/route')
    const req = new Request('http://localhost/api/favorites')
    const res = await GET(req as any)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.favorites).toHaveLength(1)
    expect(json.favorites[0].id).toBe('v1')
    expect(json.favorites[0].favoritedAt).toEqual(new Date('2024-01-01'))
  })
})
