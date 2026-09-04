export interface Notification {
    id: string
    type: string
    title: string
    message: string
    link: string | null
    isRead: boolean
    createdAt: string
    updatedAt: string
    count?: number
    metadata: any
}
