/**
 * Utility functions shared across the app
 */

/**
 * Check if the user has soft-logged out (client-side)
 */
export function isSoftLogout(): boolean {
    if (typeof document === 'undefined') return false
    return (
        document.cookie.includes('soft_logout=true') ||
        localStorage.getItem('soft_logout') === 'true'
    )
}

/**
 * Check if the user has soft-logged out (server-side)
 */
export function isSoftLogoutServer(cookies: { get: (name: string) => { value: string } | undefined }): boolean {
    return cookies.get('soft_logout')?.value === 'true'
}
