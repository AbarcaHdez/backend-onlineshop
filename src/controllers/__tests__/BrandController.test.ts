import request from 'supertest'
import server from '../../server'
import Brand from '../../models/Brand'
import jwt from 'jsonwebtoken'

jest.mock('../../config/db')

jest.mock('jsonwebtoken')

jest.mock('../../models/Brand', () => {
    const mockBrand = jest.fn()
    return {
        __esModule: true,
        default: Object.assign(mockBrand, {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn()
        })
    }
})

const validId = '6a7a07ec0051cb71fd6f5806'
const authHeader = 'Bearer test-token'

const validBrandBody = {
  "name": "Dior",
  "slug": "dior",
  "description": "Marca de perfume popular"
}

describe('BrandController', () => {

    beforeEach(() => {
        (jwt.verify as jest.Mock).mockReturnValue({ id: 'admin-id' })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('POST /api/brands (createBrand)', () => {
        it('debe responder 400 si faltan campos obligatorios', async () => {
            const response = await request(server).post('/api/brands').set('Authorization', authHeader).send({})

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('errors')
            expect(response.body.errors).toHaveLength(4)

            expect(response.status).not.toBe(201)
            expect(response.body.errors).not.toHaveLength(1)
        })

        it('debe crear una marca y responder 201', async () => {
            const save = jest.fn().mockResolvedValue(undefined)
            ;(Brand as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server).post('/api/brands').set('Authorization', authHeader).send(validBrandBody)

            expect(response.status).toBe(201)
            expect(response.body.name).toBe(validBrandBody.name)
            expect(save).toHaveBeenCalled()
        })

        it('debe responder 400 si el slug ya existe (duplicado)', async () => {
            const duplicateError: any = new Error('duplicate key')
            duplicateError.code = 11000
            duplicateError.keyValue = { slug: 'dior' }

            const save = jest.fn().mockRejectedValue(duplicateError)
            ;(Brand as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server).post('/api/brands').set('Authorization', authHeader).send(validBrandBody)

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('errors')
            expect(response.body.errors[0].msg).toBe(`El valor de 'slug' ya esta en uso`)
            expect(response.body.errors[0].msg).toContain("'slug'")

            expect(response.status).not.toBe(201)
        })

        it('debe responder 400 si Mongoose lanza un ValidationError', async () => {
            const validationError: any = new Error('Validation failed')
            validationError.name = 'ValidationError'
            validationError.errors = {
                name: { message: 'El nombre de la marca es obligatorio' }
            }

            const save = jest.fn().mockRejectedValue(validationError)
            ;(Brand as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/brands').set('Authorization', authHeader)
                .send(validBrandBody)

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toBe('El nombre de la marca es obligatorio')
        })
        
        it('debe responder 500 si ocurre un error inesperado al guardar', async () => {
            const save = jest.fn().mockRejectedValue(new Error('fallo inesperado'))
            ;(Brand as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/brands').set('Authorization', authHeader)
                .send(validBrandBody)

            expect(response.status).toBe(500)
            expect(response.body.errors[0].msg).toBe('Hubo un error al crear la marca')
        })

        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server)
                .post('/api/brands')
                .send(validBrandBody)

            expect(response.status).toBe(401)
        })
    })

    describe('GET /api/brands (getAllBrands)', () => {
        it('debe responder 200 con la lista de marcas visibles', async () => {
            (Brand.find as jest.Mock).mockResolvedValue([{ name: 'Dior' }])

            const response = await request(server).get('/api/brands')

            expect(response.status).toBe(200)
            expect(Brand.find).toHaveBeenCalledWith({ show: true })
            expect(response.body).toHaveLength(1)

            expect(response.status).not.toBe('400')
        })

        it('debe responder 500 si Brand.find falla', async () => {
            (Brand.find as jest.Mock).mockRejectedValue(new Error('fallo de conexion'))

            const response = await request(server).get('/api/brands')

            expect(response.status).toBe(500)
        })
    })

    describe('GET /api/brands/:id (getBrandById)', () => {
        it('debe responder 400 si el id no es un ObjectId válido', async() => {
            const response = await request(server).get('/api/brands/id-no-valido')

            expect(response.status).toBe(400)
        })

        it('debe responder 404 si la marca no existe o está eliminada', async () => {
            (Brand.findOne as jest.Mock).mockResolvedValue(null)

            const response = await request(server).get(`/api/brands/${validId}`)

            expect(response.status).toBe(404)
        })

        it('debe responder 200 con la marca encontrada', async () => {
            (Brand.findOne as jest.Mock).mockResolvedValue({ _id: validId, ... validBrandBody })
            
            const response = await request(server).get(`/api/brands/${validId}`)

            expect(response.status).toBe(200)
            expect(Brand.findOne).toHaveBeenCalledWith({ _id: validId, show: true })
        })

        it('debe responder 500 si Brand.findOne falla', async () => {
            (Brand.findOne as jest.Mock).mockRejectedValue(new Error('fallo de conexion'))

            const response = await request(server).get(`/api/brands/${validId}`)

            expect(response.status).toBe(500)
        })
    })

    describe('PUT /api/brands/:id (updateBrandById)', () => {
        it('debe responder 400 si el body está vacío', async () => {
            const response = await request(server).put(`/api/brands/${validId}`).set('Authorization', authHeader).send({})

            expect(response.status).toBe(400)
            expect(response.body.errors.some((e: any) => e.msg === 'Debes enviar al menos un campo para actualizar')).toBe(true)
        })

        it('debe responder 404 si la marca no existe', async () => {
            (Brand.findOneAndUpdate as jest.Mock).mockResolvedValue(null)

            const response = await request(server).put(`/api/brands/${validId}`).set('Authorization', authHeader).send({ name: 'Apple' })

            expect(response.status).toBe(404)

        })

        it('debe responder 200 con la marca actualizada', async () => {
            (Brand.findOneAndUpdate as jest.Mock).mockResolvedValue({ _id: validId, name: 'Apple'})

            const response = await request(server).put(`/api/brands/${validId}`).set('Authorization', authHeader).send({ name: 'Apple'})

            expect(response.status).toBe(200)
            expect(response.body.name).toBe('Apple')

        })

        it('debe responder 400 si el update produce un duplicado (11000)', async () => {
            const duplicateError: any = new Error('duplicate key')
            duplicateError.code = 11000
            duplicateError.keyValue = { slug: 'dior' }
            ;(Brand.findOneAndUpdate as jest.Mock).mockRejectedValue(duplicateError)

            const response = await request(server)
                .put(`/api/brands/${validId}`).set('Authorization', authHeader)
                .send({ slug: 'dior' })

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toContain("'slug'")
        })

        it('debe responder 400 si el update dispara un ValidationError', async () => {
            const validationError: any = new Error('Validation failed')
            validationError.name = 'ValidationError'
            validationError.errors = {
                name: { message: 'El nombre no puede estar vacio' }
            }
            ;(Brand.findOneAndUpdate as jest.Mock).mockRejectedValue(validationError)

            const response = await request(server)
                .put(`/api/brands/${validId}`).set('Authorization', authHeader)
                .send({ name: 'Apple' })

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toBe('El nombre no puede estar vacio')
        })

        it('debe responder 500 si ocurre un error inesperado al actualizar', async () => {
            (Brand.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('fallo inesperado'))

            const response = await request(server)
                .put(`/api/brands/${validId}`).set('Authorization', authHeader)
                .send({ name: 'Apple' })

            expect(response.status).toBe(500)
        })

        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server)
                .put(`/api/brands/${validId}`)
                .send({ name: 'Apple' })

            expect(response.status).toBe(401)
        })
    })

    describe('PATCH /api/brands/:id (updateStatusBrandById)', () => {
        it('debe invertir isActive y responder 200', async () => {
            const save = jest.fn().mockResolvedValue(undefined)
            ;(Brand.findOne as jest.Mock).mockResolvedValue({ isActive: false, save })

            const response = await request(server).patch(`/api/brands/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(200)
            expect(response.body.isActive).toBe(true)
            expect(save).toHaveBeenCalled()
        })

        it('debe responder 404 si la marca no existe', async () => {
            (Brand.findOne as jest.Mock).mockResolvedValue(null)

            const response = await request(server).patch(`/api/brands/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(404)
        })

        it('debe responder 500 si ocurre un error inesperado', async () => {
            (Brand.findOne as jest.Mock).mockRejectedValue(new Error('fallo inesperado'))

            const response = await request(server).patch(`/api/brands/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(500)
        })

        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server).patch(`/api/brands/${validId}`)

            expect(response.status).toBe(401)
        })
    })

    describe('DELETE /api/brands/:id (deleteBrandById)', () => {
        it('debe marcar show en false y responder 200', async () => {
            const save = jest.fn().mockResolvedValue(undefined)
            const brand = { show: true, save }
            ;(Brand.findOne as jest.Mock).mockResolvedValue(brand)

            const response = await request(server).delete(`/api/brands/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(200)
            expect(brand.show).toBe(false)
            expect(save).toHaveBeenCalled()

            expect(response.status).not.toBe(400)
        })

        it('debe responder 404 si la marca ya no existe', async () => {
            (Brand.findOne as jest.Mock).mockResolvedValue(null)

            const response = await request(server).delete(`/api/brands/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(404)
            expect(response.status).not.toBe(200)
        })

        it('debe responder 500 si ocurre un error inesperado', async () => {
            (Brand.findOne as jest.Mock).mockRejectedValue(new Error('fallo inesperado'))

            const response = await request(server).delete(`/api/brands/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(500)
        })

        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server).delete(`/api/brands/${validId}`)

            expect(response.status).toBe(401)
        })
    })

})