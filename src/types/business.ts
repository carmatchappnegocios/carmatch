export interface Business {
    id: string
    name: string
    category: string
    subcategory?: string
    latitude: number
    longitude: number
    images: string[]
    coverImage?: string
    city: string
    state?: string
    country?: string
    description?: string
    services?: string[]
    phone?: string
    additionalPhones?: string[]
    whatsapp?: string
    telegram?: string
    email?: string
    website?: string
    facebook?: string
    instagram?: string
    tiktok?: string
    address?: string
    street?: string
    streetNumber?: string
    colony?: string
    zipCode?: string
    hours?: string
    is24Hours?: boolean
    hasEmergencyService?: boolean
    hasHomeService?: boolean
    rating?: number
    totalReviews?: number
    userId?: string
    isActive?: boolean
    status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
    createdAt?: string | Date
    updatedAt?: string | Date
    expiresAt?: string
    stripeCustomerId?: string
    stripeSubscriptionId?: string | null
    subscriptionStatus?: string | null
}
