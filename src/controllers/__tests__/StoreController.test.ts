import request from 'supertest'
import server from '../../server'
import Store from '../../models/Store'
import jwt from 'jsonwebtoken'

jest.mock('../../config/db')

jest.mock('jsonwebtoken')

jest.mock('../../models/Store', () => {
    return {
        __esModule: true,
        default: {
            findOneAndUpdate: jest.fn()
        }
    }
})

const authHeader = 'Bearer test-token'

const validStoreBody = {
    name: 'Perfumeria Dior',
    whatsappNumber: '+521234567890',
    currency: 'MXN',
    logoUrl: 'https://ejemplo.com/logo.png',
    primaryColor: '#1a1a2e',
    secondaryColor: '#e94560'
}

describe('StoreController', () => {

    beforeEach(() => {
        (jwt.verify as jest.Mock).mockReturnValue({ id: 'admin-id' })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('GET /api/store (getStore)', () => {
        it('debe responder 200 con la configuracion de la tienda', async () => {
            (Store.findOneAndUpdate as jest.Mock).mockResolvedValue({ name: '', currency: 'MXN' })

            const response = await request(server).get('/api/store')

            expect(response.status).toBe(200)
            expect(response.body.currency).toBe('MXN')
        })

        it('debe crear la tienda con upsert si todavia no existe', async () => {
            (Store.findOneAndUpdate as jest.Mock).mockResolvedValue({ name: '', currency: 'MXN' })

            await request(server).get('/api/store')

            expect(Store.findOneAndUpdate).toHaveBeenCalledWith({}, {}, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            })
        })

        it('debe responder 500 si Store.findOneAndUpdate falla', async () => {
            (Store.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('fallo de conexion'))

            const response = await request(server).get('/api/store')

            expect(response.status).toBe(500)
            expect(response.body.errors[0].msg).toBe('Hubo un error al obtener la configuracion de la tienda')
        })
    })

    describe('PUT /api/store (updateStore)', () => {
        it('debe responder 400 si el body esta vacio', async () => {
            const response = await request(server).put('/api/store').set('Authorization', authHeader).send({})

            expect(response.status).toBe(400)
            expect(response.body.errors.some((e: any) => e.msg === 'Debes enviar al menos un campo para actualizar')).toBe(true)
        })

        it('debe responder 400 si logoUrl no es una url valida', async () => {
            const response = await request(server)
                .put('/api/store').set('Authorization', authHeader)
                .send({ logoUrl: 'no-es-una-url' })

            expect(response.status).toBe(400)
            expect(response.body.errors.some((e: any) => e.msg === 'logoUrl debe ser una url valida')).toBe(true)
        })

        it('debe aceptar logoUrl como una url local (localhost, sin TLD)', async () => {
            (Store.findOneAndUpdate as jest.Mock).mockResolvedValue({ logoUrl: 'http://localhost:5000/uploads/logo.jpg' })

            const response = await request(server)
                .put('/api/store').set('Authorization', authHeader)
                .send({ logoUrl: 'http://localhost:5000/uploads/logo.jpg' })

            expect(response.status).toBe(200)
        })

        it('debe responder 400 si primaryColor no es un color hex valido', async () => {
            const response = await request(server)
                .put('/api/store').set('Authorization', authHeader)
                .send({ primaryColor: 'azul' })

            expect(response.status).toBe(400)
            expect(response.body.errors.some((e: any) => e.msg === 'primaryColor debe ser un color hex valido')).toBe(true)
        })

        it('debe aceptar campos opcionales vacios (string vacio) sin fallar la validacion', async () => {
            (Store.findOneAndUpdate as jest.Mock).mockResolvedValue({ name: '', logoUrl: '', primaryColor: '', secondaryColor: '' })

            const response = await request(server)
                .put('/api/store').set('Authorization', authHeader)
                .send({ name: '', whatsappNumber: '', logoUrl: '', primaryColor: '', secondaryColor: '', currency: '' })

            expect(response.status).toBe(200)
        })

        it('debe responder 400 si currency no tiene 3 letras', async () => {
            const response = await request(server)
                .put('/api/store').set('Authorization', authHeader)
                .send({ currency: 'PESOS' })

            expect(response.status).toBe(400)
            expect(response.body.errors.some((e: any) => e.msg === 'currency debe tener 3 letras')).toBe(true)
        })

        it('debe actualizar la tienda y responder 200', async () => {
            (Store.findOneAndUpdate as jest.Mock).mockResolvedValue(validStoreBody)

            const response = await request(server)
                .put('/api/store').set('Authorization', authHeader)
                .send(validStoreBody)

            expect(response.status).toBe(200)
            expect(response.body.name).toBe(validStoreBody.name)
            expect(Store.findOneAndUpdate).toHaveBeenCalledWith({}, validStoreBody, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                runValidators: true,
                context: 'query'
            })
        })

        it('debe responder 400 si Mongoose lanza un ValidationError al actualizar', async () => {
            const validationError: any = new Error('Validation failed')
            validationError.name = 'ValidationError'
            validationError.errors = {
                currency: { message: 'currency no es valida' }
            }
            ;(Store.findOneAndUpdate as jest.Mock).mockRejectedValue(validationError)

            const response = await request(server)
                .put('/api/store').set('Authorization', authHeader)
                .send({ currency: 'MXN' })

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toBe('currency no es valida')
        })

        it('debe responder 500 si ocurre un error inesperado al actualizar', async () => {
            (Store.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('fallo inesperado'))

            const response = await request(server)
                .put('/api/store').set('Authorization', authHeader)
                .send({ name: 'Perfumeria Dior' })

            expect(response.status).toBe(500)
            expect(response.body.errors[0].msg).toBe('Hubo un error al actualizar la configuracion de la tienda')
        })

        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server)
                .put('/api/store')
                .send(validStoreBody)

            expect(response.status).toBe(401)
        })
    })

})
