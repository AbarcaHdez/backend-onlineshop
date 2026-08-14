import type { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'

export const handleInputErrors = (req: Request, res: Response, next: NextFunction) => {
    let errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }
    next()
}

// isURL() de express-validator es poco confiable para urls de imagenes: por defecto
// rechaza "localhost" (sin TLD), y relajando require_tld tambien empieza a aceptar
// texto que no es una url (ej. "no-es-una-url", que parece un hostname valido de un
// solo label). El constructor URL nativo evita ambos problemas.
export const isValidUrl = (value: string) => {
    try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
        return false
    }
}