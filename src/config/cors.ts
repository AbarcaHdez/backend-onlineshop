import type { CorsOptions } from 'cors'

// FRONTEND_URL: dominio(s) del frontend en produccion (separados por coma si hay mas de uno).
// Sin configurar (desarrollo, mientras el frontend todavia no existe) se permite cualquier origen.
const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        // sin origin: requests sin navegador (Postman, curl, apps moviles) - siempre se permiten
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        callback(new Error('No permitido por CORS'))
    }
}
