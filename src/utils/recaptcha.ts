// Verifica un token de Google reCAPTCHA v2 contra la API de Google antes de
// confiar en un pedido publico (sin login) - evita que un bot spamee POST /api/orders.
export const verifyRecaptcha = async (token: string): Promise<boolean> => {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    if (!secretKey || !token) return false

    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ secret: secretKey, response: token }).toString()
        })
        const data = await response.json() as { success: boolean }
        return data.success === true
    } catch {
        return false
    }
}
