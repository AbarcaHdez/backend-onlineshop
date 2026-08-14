import type { Request, Response, NextFunction } from 'express'
import multer from 'multer'
import { upload } from '../config/upload'

export const uploadSingleImage = (req: Request, res: Response, next: NextFunction) => {
    upload.single('image')(req, res, (error: any) => {
        if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ errors: [{ msg: 'La imagen no debe superar los 5MB' }] })
        }
        if (error) {
            return res.status(400).json({ errors: [{ msg: error.message }] })
        }
        next()
    })
}
