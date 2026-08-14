import type { Request, Response } from 'express'

export class UploadController {

    static uploadImage = (req: Request, res: Response) => {
        if (!req.file) {
            return res.status(400).json({ errors: [{ msg: 'Debes enviar una imagen' }] })
        }
        const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
        res.status(201).json({ url })
    }

}
