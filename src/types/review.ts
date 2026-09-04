export interface Review {
    id: string
    rating: number
    comment: string | null
    createdAt: string
    user: {
        id: string
        name: string | null
        image: string | null
    }
}
