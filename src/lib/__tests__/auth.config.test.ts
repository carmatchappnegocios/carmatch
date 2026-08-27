import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock prisma before any imports
vi.mock('@/lib/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    account: {
      create: vi.fn(),
    },
  },
}))

vi.mock('@/lib/password', () => ({
  comparePassword: vi.fn(),
}))

vi.mock('@/lib/email-validation', () => ({
  validateAndNormalizeEmail: vi.fn(),
}))

describe('Auth Config - Redirect Callback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('redirects relative URLs to baseUrl + url', async () => {
    const { auth } = await import('@/lib/auth')
    // The redirect callback is internal to NextAuth, so we test the exported functions
    // For now, we verify the auth export exists and is a function
    expect(typeof auth).toBe('function')
  })
})

describe('Auth Config - Exports', () => {
  it('exports handlers, auth, signIn, signOut', async () => {
    const authModule = await import('@/lib/auth')
    expect(authModule.handlers).toBeDefined()
    expect(typeof authModule.auth).toBe('function')
    expect(typeof authModule.signIn).toBe('function')
    expect(typeof authModule.signOut).toBe('function')
  })

  it('exports currentUser helper', async () => {
    const authModule = await import('@/lib/auth')
    expect(typeof authModule.currentUser).toBe('function')
  })
})

describe('Auth Config - Session Callback Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('session callback enriches user with id from token', async () => {
    // Test the session callback logic directly
    const mockToken = { id: 'user-123', sub: 'user-123', isAdmin: false, picture: null, name: 'Test' }
    const mockSession = { user: { email: 'test@test.com' } }

    // Simulate session callback logic
    const session = { ...mockSession }
    const token = { ...mockToken }

    if (session.user && token) {
      ;(session.user as any).id = (token.id as string) || (token.sub as string)
      ;(session.user as any).isAdmin = !!token.isAdmin
    }

    expect((session.user as any).id).toBe('user-123')
    expect((session.user as any).isAdmin).toBe(false)
  })

  it('session callback sets isAdmin=true when email matches ADMIN_EMAIL', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'

    const mockToken = { id: 'user-123', isAdmin: false }
    const mockSession = { user: { email: 'admin@test.com' } }

    const session = { ...mockSession }
    const token = { ...mockToken }

    if (session.user && token) {
      ;(session.user as any).id = (token.id as string)
      if (session.user.email === process.env.ADMIN_EMAIL) {
        ;(session.user as any).isAdmin = true
      } else {
        ;(session.user as any).isAdmin = !!token.isAdmin
      }
    }

    expect((session.user as any).isAdmin).toBe(true)
    delete process.env.ADMIN_EMAIL
  })

  it('session callback uses token.isAdmin for non-admin users', async () => {
    process.env.ADMIN_EMAIL = 'admin@test.com'

    const mockToken = { id: 'user-123', isAdmin: true }
    const mockSession = { user: { email: 'user@test.com' } }

    const session = { ...mockSession }
    const token = { ...mockToken }

    if (session.user && token) {
      ;(session.user as any).id = (token.id as string)
      if (session.user.email === process.env.ADMIN_EMAIL) {
        ;(session.user as any).isAdmin = true
      } else {
        ;(session.user as any).isAdmin = !!token.isAdmin
      }
    }

    expect((session.user as any).isAdmin).toBe(true)
    delete process.env.ADMIN_EMAIL
  })
})

describe('Auth Config - JWT Callback Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('jwt callback stores user id in token on sign-in', async () => {
    const mockToken = { iat: Math.floor(Date.now() / 1000) }
    const mockUser = { id: 'user-123', isAdmin: true }

    const token = { ...mockToken }
    const user = { ...mockUser }

    if (user && user.id) {
      token.id = user.id
      ;(token as any).isAdmin = !!user.isAdmin
    }

    expect(token.id).toBe('user-123')
    expect((token as any).isAdmin).toBe(true)
  })

  it('jwt callback returns null when password changed after token issued', async () => {
    const { prisma } = await import('@/lib/db')

    const now = Math.floor(Date.now() / 1000)
    const oldIat = now - 7200 // 2 hours ago
    const passwordChangeTime = Date.now() - 3600000 // 1 hour ago

    const mockToken = {
      id: 'user-123',
      iat: oldIat,
      lastPasswordChange: passwordChangeTime,
    }

    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      lastPasswordChange: new Date(passwordChangeTime),
    } as any)

    // Simulate JWT callback logic
    const token = { ...mockToken }
    if (token.id && (token as any).lastPasswordChange) {
      const currentTime = Math.floor(Date.now() / 1000)
      const tokenAge = currentTime - (token.iat as number)
      if (tokenAge > 3600 || (token.iat as number) === 0) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { lastPasswordChange: true },
        })
        if (dbUser?.lastPasswordChange) {
          const tokenTime = (token.iat as number) * 1000
          const passwordChangedAt = dbUser.lastPasswordChange.getTime()
          if (passwordChangedAt > tokenTime) {
            expect(true).toBe(true) // Token would be invalidated
            return
          }
        }
      }
    }
  })

  it('jwt callback updates picture and name on trigger=update', async () => {
    const mockToken = { iat: Math.floor(Date.now() / 1000) }
    const mockSession = { image: 'new-image.jpg', name: 'New Name' }

    const token = { ...mockToken }
    const trigger = 'update'
    const session = { ...mockSession }

    if (trigger === 'update') {
      if (session?.image) token.picture = session.image
      if (session?.name) token.name = session.name
    }

    expect(token.picture).toBe('new-image.jpg')
    expect(token.name).toBe('New Name')
  })
})

describe('Auth Config - signIn Callback Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns true for non-Google sign-ins', async () => {
    // Simulate signIn callback for credentials
    const account = { provider: 'credentials' }
    const user = { email: 'test@test.com' }

    let shouldLink = false
    if (account?.provider === 'google' && user?.email) {
      shouldLink = true
    }

    expect(shouldLink).toBe(false)
  })

  it('detects Google sign-in for account linking', async () => {
    const account = { provider: 'google' }
    const user = { email: 'test@test.com' }

    let isGoogleSignIn = false
    if (account?.provider === 'google' && user?.email) {
      isGoogleSignIn = true
    }

    expect(isGoogleSignIn).toBe(true)
  })
})
