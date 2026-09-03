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
    whatsapp?: string
    email?: string
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
    createdAt?: string | Date
    updatedAt?: string | Date
    stripeCustomerId?: string
    subscriptionStatus?: string
}
