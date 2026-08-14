import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ errors: [{ msg: 'No autorizado' }] })
    }

    const token = authHeader.split(' ')[1]
    try {
        jwt.verify(token, process.env.JWT_SECRET as string)
        next()
    } catch (error) {
        res.status(401).json({ errors: [{ msg: 'Token invalido o expirado' }] })
    }
}
