import multer from 'multer'
import { uploadSingleImage } from '../upload'
import { upload } from '../../config/upload'

jest.mock('../../config/upload', () => ({
    upload: { single: jest.fn() }
}))

describe('uploadSingleImage', () => {

    const mockRes = () => {
        const res: any = {}
        res.status = jest.fn().mockReturnValue(res)
        res.json = jest.fn().mockReturnValue(res)
        return res
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('debe llamar a next si la subida es exitosa', () => {
        (upload.single as jest.Mock).mockReturnValue((req: any, res: any, cb: any) => {
            req.file = { filename: 'abc123.jpg' }
            cb()
        })
        const req: any = {}
        const res = mockRes()
        const next = jest.fn()

        uploadSingleImage(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(req.file.filename).toBe('abc123.jpg')
        expect(res.status).not.toHaveBeenCalled()
    })

    it('debe responder 400 si el archivo supera el limite de tamano', () => {
        const sizeError = new multer.MulterError('LIMIT_FILE_SIZE')
        ;(upload.single as jest.Mock).mockReturnValue((req: any, res: any, cb: any) => cb(sizeError))
        const req: any = {}
        const res = mockRes()
        const next = jest.fn()

        uploadSingleImage(req, res, next)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: 'La imagen no debe superar los 5MB' }] })
        expect(next).not.toHaveBeenCalled()
    })

    it('debe responder 400 si el fileFilter rechaza el archivo', () => {
        (upload.single as jest.Mock).mockReturnValue((req: any, res: any, cb: any) =>
            cb(new Error('Formato de imagen no permitido (solo jpg, png, webp o gif)'))
        )
        const req: any = {}
        const res = mockRes()
        const next = jest.fn()

        uploadSingleImage(req, res, next)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({
            errors: [{ msg: 'Formato de imagen no permitido (solo jpg, png, webp o gif)' }]
        })
        expect(next).not.toHaveBeenCalled()
    })

})
