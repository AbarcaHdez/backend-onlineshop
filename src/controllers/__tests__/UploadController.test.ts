import request from 'supertest'
import server from '../../server'
import { upload } from '../../config/upload'
import jwt from 'jsonwebtoken'

jest.mock('../../config/db')

jest.mock('jsonwebtoken')

jest.mock('../../config/upload', () => ({
    upload: { single: jest.fn() }
}))

const authHeader = 'Bearer test-token'

describe('UploadController', () => {

    beforeEach(() => {
        (jwt.verify as jest.Mock).mockReturnValue({ id: 'admin-id' })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('POST /api/uploads (uploadImage)', () => {
        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server).post('/api/uploads')

            expect(response.status).toBe(401)
        })

        it('debe responder 400 si multer rechaza el archivo', async () => {
            (upload.single as jest.Mock).mockReturnValue((req: any, res: any, cb: any) => {
                cb(new Error('Formato de imagen no permitido (solo jpg, png, webp o gif)'))
            })

            const response = await request(server).post('/api/uploads').set('Authorization', authHeader)

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toBe('Formato de imagen no permitido (solo jpg, png, webp o gif)')
        })

        it('debe responder 400 si no se envia ninguna imagen', async () => {
            (upload.single as jest.Mock).mockReturnValue((req: any, res: any, cb: any) => {
                cb()
            })

            const response = await request(server).post('/api/uploads').set('Authorization', authHeader)

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toBe('Debes enviar una imagen')
        })

        it('debe subir la imagen y responder 201 con la url', async () => {
            (upload.single as jest.Mock).mockReturnValue((req: any, res: any, cb: any) => {
                req.file = { filename: 'abc123.jpg' }
                cb()
            })

            const response = await request(server).post('/api/uploads').set('Authorization', authHeader)

            expect(response.status).toBe(201)
            expect(response.body.url).toMatch(/^http:\/\/.+\/uploads\/abc123\.jpg$/)
        })
    })

})
