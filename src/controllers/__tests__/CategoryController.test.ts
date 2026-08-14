import request from 'supertest'
import server from '../../server'
import Category from '../../models/Category'
import jwt from 'jsonwebtoken'

jest.mock('../../config/db')

jest.mock('jsonwebtoken')

jest.mock('../../models/Category', () => {
    const mockCategory = jest.fn()
    return {
        __esModule: true,
        default: Object.assign(mockCategory, {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn()
        })
    }
})

const validId = '64f1a2b3c4d5e6f7a8b9c0d1'
const authHeader = 'Bearer test-token'

const validCategoryBody = {
    name: 'Ropa',
    slug: 'ropa'
}

describe('CategoryController', () => {

    beforeEach(() => {
        (jwt.verify as jest.Mock).mockReturnValue({ id: 'admin-id' })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('POST /api/categories (createCategory)', () => {
        it('debe responder 400 si faltan campos obligatorios', async () => {
            const response = await request(server).post('/api/categories').set('Authorization', authHeader).send({})

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('errors')
        })

        it('debe crear una categoria y responder 201', async () => {
            const save = jest.fn().mockResolvedValue(undefined)
            ;(Category as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/categories').set('Authorization', authHeader)
                .send(validCategoryBody)

            expect(response.status).toBe(201)
            expect(response.body.name).toBe(validCategoryBody.name)
            expect(save).toHaveBeenCalled()
        })

        it('debe responder 400 si el slug ya existe (duplicado)', async () => {
            const duplicateError: any = new Error('duplicate key')
            duplicateError.code = 11000
            duplicateError.keyValue = { slug: 'ropa' }

            const save = jest.fn().mockRejectedValue(duplicateError)
            ;(Category as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/categories').set('Authorization', authHeader)
                .send(validCategoryBody)

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
                name: { message: 'El nombre de la categoria es obligatorio' }
            }

            const save = jest.fn().mockRejectedValue(validationError)
            ;(Category as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/categories').set('Authorization', authHeader)
                .send(validCategoryBody)

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toBe('El nombre de la categoria es obligatorio')
        })

        it('debe responder 500 si ocurre un error inesperado al guardar', async () => {
            const save = jest.fn().mockRejectedValue(new Error('fallo inesperado'))
            ;(Category as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/categories').set('Authorization', authHeader)
                .send(validCategoryBody)

            expect(response.status).toBe(500)
            expect(response.body.errors[0].msg).toBe('Hubo un error al crear la categoria')
        })

        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server)
                .post('/api/categories')
                .send(validCategoryBody)

            expect(response.status).toBe(401)
        })
    })

    describe('GET /api/categories (getAllCategories)', () => {
        it('debe responder 200 con la lista de categorias visibles', async () => {
            (Category.find as jest.Mock).mockResolvedValue([{ name: 'Ropa' }])

            const response = await request(server).get('/api/categories')

            expect(response.status).toBe(200)
            expect(Category.find).toHaveBeenCalledWith({ show: true })
            expect(response.body).toHaveLength(1)

            expect(response.status).not.toBe('400')
        })

        it('debe responder 500 si Category.find falla', async () => {
            (Category.find as jest.Mock).mockRejectedValue(new Error('fallo de conexion'))

            const response = await request(server).get('/api/categories')

            expect(response.status).toBe(500)
        })
    })

    describe('GET /api/categories/:id (getCategoryById)', () => {
        it('debe responder 400 si el id no es un ObjectId válido', async () => {
            const response = await request(server).get('/api/categories/id-no-valido')

            expect(response.status).toBe(400)
        })

        it('debe responder 404 si la categoria no existe o está eliminada', async () => {
            (Category.findOne as jest.Mock).mockResolvedValue(null)

            const response = await request(server).get(`/api/categories/${validId}`)

            expect(response.status).toBe(404)
        })

        it('debe responder 200 con la categoria encontrada', async () => {
            (Category.findOne as jest.Mock).mockResolvedValue({ _id: validId, ...validCategoryBody })

            const response = await request(server).get(`/api/categories/${validId}`)

            expect(response.status).toBe(200)
            expect(Category.findOne).toHaveBeenCalledWith({ _id: validId, show: true })
        })

        it('debe responder 500 si Category.findOne falla', async () => {
            (Category.findOne as jest.Mock).mockRejectedValue(new Error('fallo de conexion'))

            const response = await request(server).get(`/api/categories/${validId}`)

            expect(response.status).toBe(500)
        })
    })

    describe('PUT /api/categories/:id (updateCategoryById)', () => {
        it('debe responder 400 si el body está vacío', async () => {
            const response = await request(server)
                .put(`/api/categories/${validId}`).set('Authorization', authHeader)
                .send({})

            expect(response.status).toBe(400)
            expect(response.body.errors.some((e: any) => e.msg === 'Debes enviar al menos un campo para actualizar')).toBe(true)
        })

        it('debe responder 404 si la categoria no existe', async () => {
            (Category.findOneAndUpdate as jest.Mock).mockResolvedValue(null)

            const response = await request(server)
                .put(`/api/categories/${validId}`).set('Authorization', authHeader)
                .send({ name: 'Calzado' })

            expect(response.status).toBe(404)
        })

        it('debe responder 200 con la categoria actualizada', async () => {
            (Category.findOneAndUpdate as jest.Mock).mockResolvedValue({ _id: validId, name: 'Calzado' })

            const response = await request(server)
                .put(`/api/categories/${validId}`).set('Authorization', authHeader)
                .send({ name: 'Calzado' })

            expect(response.status).toBe(200)
            expect(response.body.name).toBe('Calzado')
        })

        it('debe responder 400 si el update produce un duplicado (11000)', async () => {
            const duplicateError: any = new Error('duplicate key')
            duplicateError.code = 11000
            duplicateError.keyValue = { slug: 'ropa' }
            ;(Category.findOneAndUpdate as jest.Mock).mockRejectedValue(duplicateError)

            const response = await request(server)
                .put(`/api/categories/${validId}`).set('Authorization', authHeader)
                .send({ slug: 'ropa' })

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toContain("'slug'")
        })

        it('debe responder 400 si el update dispara un ValidationError', async () => {
            const validationError: any = new Error('Validation failed')
            validationError.name = 'ValidationError'
            validationError.errors = {
                name: { message: 'El nombre no puede estar vacio' }
            }
            ;(Category.findOneAndUpdate as jest.Mock).mockRejectedValue(validationError)

            const response = await request(server)
                .put(`/api/categories/${validId}`).set('Authorization', authHeader)
                .send({ name: 'Calzado' })

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toBe('El nombre no puede estar vacio')
        })

        it('debe responder 500 si ocurre un error inesperado al actualizar', async () => {
            (Category.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('fallo inesperado'))

            const response = await request(server)
                .put(`/api/categories/${validId}`).set('Authorization', authHeader)
                .send({ name: 'Calzado' })

            expect(response.status).toBe(500)
        })

        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server)
                .put(`/api/categories/${validId}`)
                .send({ name: 'Calzado' })

            expect(response.status).toBe(401)
        })
    })

    describe('PATCH /api/categories/:id (updateStatusCategoryById)', () => {
        it('debe invertir isActive y responder 200', async () => {
            const save = jest.fn().mockResolvedValue(undefined)
            ;(Category.findOne as jest.Mock).mockResolvedValue({ isActive: false, save })

            const response = await request(server).patch(`/api/categories/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(200)
            expect(response.body.isActive).toBe(true)
            expect(save).toHaveBeenCalled()
        })

        it('debe responder 404 si la categoria no existe', async () => {
            (Category.findOne as jest.Mock).mockResolvedValue(null)

            const response = await request(server).patch(`/api/categories/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(404)
        })

        it('debe responder 500 si ocurre un error inesperado', async () => {
            (Category.findOne as jest.Mock).mockRejectedValue(new Error('fallo inesperado'))

            const response = await request(server).patch(`/api/categories/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(500)
        })

        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server).patch(`/api/categories/${validId}`)

            expect(response.status).toBe(401)
        })
    })

    describe('DELETE /api/categories/:id (deleteCategoryById)', () => {
        it('debe marcar show en false y responder 200', async () => {
            const save = jest.fn().mockResolvedValue(undefined)
            const category = { show: true, save }
            ;(Category.findOne as jest.Mock).mockResolvedValue(category)

            const response = await request(server).delete(`/api/categories/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(200)
            expect(category.show).toBe(false)
            expect(save).toHaveBeenCalled()

            expect(response.status).not.toBe(400)
        })

        it('debe responder 404 si la categoria ya no existe', async () => {
            (Category.findOne as jest.Mock).mockResolvedValue(null)

            const response = await request(server).delete(`/api/categories/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(404)
            expect(response.status).not.toBe(200)
        })

        it('debe responder 500 si ocurre un error inesperado', async () => {
            (Category.findOne as jest.Mock).mockRejectedValue(new Error('fallo inesperado'))

            const response = await request(server).delete(`/api/categories/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(500)
        })

        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server).delete(`/api/categories/${validId}`)

            expect(response.status).toBe(401)
        })
    })

})
