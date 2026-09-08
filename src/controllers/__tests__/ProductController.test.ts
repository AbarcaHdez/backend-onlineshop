import request from 'supertest'
import server from '../../server'
import Product from '../../models/Product'
import Brand from '../../models/Brand'
import Category from '../../models/Category'
import jwt from 'jsonwebtoken'

jest.mock('../../config/db')

jest.mock('jsonwebtoken')

jest.mock('../../models/Product', () => {
    const mockProduct = jest.fn()
    return {
        __esModule: true,
        default: Object.assign(mockProduct, {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn()
        })
    }
})

jest.mock('../../models/Brand', () => {
    return {
        __esModule: true,
        default: {
            findOne: jest.fn()
        }
    }
})

jest.mock('../../models/Category', () => {
    return {
        __esModule: true,
        default: {
            countDocuments: jest.fn()
        }
    }
})

const validId = '64f1a2b3c4d5e6f7a8b9c0d1'
const validBrandId = '64f1a2b3c4d5e6f7a8b9c0d2'
const validCategoryId = '64f1a2b3c4d5e6f7a8b9c0d3'
const authHeader = 'Bearer test-token'

// getAllProducts/getProductById encadenan .populate() sobre el resultado de
// Product.find()/findOne(), asi que el mock debe simular una Query de Mongoose:
// un objeto "thenable" (con .then) donde .populate() devuelve el mismo objeto.
const mockQuery = (promise: Promise<unknown>) => {
    const query: any = {
        sort: jest.fn(() => query),
        populate: jest.fn(() => query),
        then: (onFulfilled?: any, onRejected?: any) => promise.then(onFulfilled, onRejected)
    }
    return query
}

const validProductBody = {
    name: 'Cuaderno Profesional',
    slug: 'cuaderno-profesional',
    price: 65
}

describe('ProductController', () => {

    beforeEach(() => {
        (jwt.verify as jest.Mock).mockReturnValue({ id: 'admin-id' })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('POST /api/products (createProduct)', () => {
        it('debe tener validación de errores', async () => {
            const response = await request(server).post('/api/products').set('Authorization', authHeader).send({})

            expect(response.status).toEqual(400)
            expect(response.body).toHaveProperty('errors')
            expect(response.body.errors).toHaveLength(6)

            expect(response.status).not.toEqual(404)
            expect(response.body.errors).not.toHaveLength(2)
        })

        it('debe crear un producto y responder 201', async () => {
            const save = jest.fn().mockResolvedValue(undefined)
            ;(Product as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/products').set('Authorization', authHeader)
                .send(validProductBody)

            expect(response.status).toBe(201)
            expect(response.body.name).toBe(validProductBody.name)
            expect(save).toHaveBeenCalled()
        })

        it('debe crear el producto sin enviar sku (campo opcional, no usado en este proyecto)', async () => {
            const save = jest.fn().mockResolvedValue(undefined)
            ;(Product as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/products').set('Authorization', authHeader)
                .send(validProductBody)

            expect(response.status).toBe(201)
            expect(response.body.sku).toBeUndefined()
        })

        it('debe responder 400 si faltan campos obligatorios', async () => {
            const response = await request(server)
                .post('/api/products').set('Authorization', authHeader)
                .send({ price: 65 })

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('errors')
        })

        it('debe responder 400 si el sku o slug ya existen (duplicado)', async () => {
            const duplicateError: any = new Error('duplicate key')
            duplicateError.code = 11000
            duplicateError.keyValue = { sku: 'PAP-CUAD-001' }

            const save = jest.fn().mockRejectedValue(duplicateError)
            ;(Product as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/products').set('Authorization', authHeader)
                .send(validProductBody)

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toContain("'sku'")
        })

        it('debe responder 400 si Mongoose lanza un ValidationError al guardar', async () => {
            const validationError: any = new Error('Validation failed')
            validationError.name = 'ValidationError'
            validationError.errors = {
                price: { message: 'El precio debe ser mayor o igual a 0' }
            }

            const save = jest.fn().mockRejectedValue(validationError)
            ;(Product as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/products').set('Authorization', authHeader)
                .send(validProductBody)

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toBe('El precio debe ser mayor o igual a 0')
        })

        it('debe responder 500 si ocurre un error inesperado al guardar', async () => {
            const save = jest.fn().mockRejectedValue(new Error('fallo inesperado'))
            ;(Product as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/products').set('Authorization', authHeader)
                .send(validProductBody)

            expect(response.status).toBe(500)
            expect(response.body.errors[0].msg).toBe('Hubo un error al crear el producto')
        })

        it('debe responder 400 si discountPrice no es menor que price', async () => {
            const response = await request(server)
                .post('/api/products').set('Authorization', authHeader)
                .send({ ...validProductBody, discountPrice: 100 })

            expect(response.status).toBe(400)
            expect(response.body.errors.some((e: any) => e.msg === 'El precio de descuento debe ser menor que el precio')).toBe(true)
        })

        it('debe crear el producto si discountPrice es menor que price', async () => {
            const save = jest.fn().mockResolvedValue(undefined)
            ;(Product as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/products').set('Authorization', authHeader)
                .send({ ...validProductBody, discountPrice: 50 })

            expect(response.status).toBe(201)
        })

        it('debe responder 400 si el brandId no corresponde a una marca existente', async () => {
            (Brand.findOne as jest.Mock).mockResolvedValue(null)

            const response = await request(server)
                .post('/api/products').set('Authorization', authHeader)
                .send({ ...validProductBody, brandId: validBrandId })

            expect(response.status).toBe(400)
            expect(response.body.errors.some((e: any) => e.msg === 'La marca indicada no existe')).toBe(true)
            expect(Brand.findOne).toHaveBeenCalledWith({ _id: validBrandId, show: true })
        })

        it('debe crear el producto si el brandId corresponde a una marca existente', async () => {
            (Brand.findOne as jest.Mock).mockResolvedValue({ _id: validBrandId, show: true })
            const save = jest.fn().mockResolvedValue(undefined)
            ;(Product as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/products').set('Authorization', authHeader)
                .send({ ...validProductBody, brandId: validBrandId })

            expect(response.status).toBe(201)
        })

        it('debe responder 400 si alguna categoryId no corresponde a una categoria existente', async () => {
            (Category.countDocuments as jest.Mock).mockResolvedValue(1)

            const response = await request(server)
                .post('/api/products').set('Authorization', authHeader)
                .send({ ...validProductBody, categoryIds: [validCategoryId, validId] })

            expect(response.status).toBe(400)
            expect(response.body.errors.some((e: any) => e.msg === 'Una o mas categorias indicadas no existen')).toBe(true)
        })

        it('debe crear el producto si todas las categoryIds corresponden a categorias existentes', async () => {
            (Category.countDocuments as jest.Mock).mockResolvedValue(1)
            const save = jest.fn().mockResolvedValue(undefined)
            ;(Product as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/products').set('Authorization', authHeader)
                .send({ ...validProductBody, categoryIds: [validCategoryId] })

            expect(response.status).toBe(201)
            expect(Category.countDocuments).toHaveBeenCalledWith({ _id: { $in: [validCategoryId] }, show: true })
        })

        it('debe crear el producto si categoryIds es un arreglo vacio (sin consultar la base de datos)', async () => {
            const save = jest.fn().mockResolvedValue(undefined)
            ;(Product as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/products').set('Authorization', authHeader)
                .send({ ...validProductBody, categoryIds: [] })

            expect(response.status).toBe(201)
            expect(Category.countDocuments).not.toHaveBeenCalled()
        })

        it('debe crear el producto si images.*.url es una url local (localhost, sin TLD)', async () => {
            const save = jest.fn().mockResolvedValue(undefined)
            ;(Product as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save })
                return this
            })

            const response = await request(server)
                .post('/api/products').set('Authorization', authHeader)
                .send({ ...validProductBody, images: [{ url: 'http://localhost:5000/uploads/foto.jpg' }] })

            expect(response.status).toBe(201)
        })

        it('debe responder 400 si images.*.url no es una url valida', async () => {
            const response = await request(server)
                .post('/api/products').set('Authorization', authHeader)
                .send({ ...validProductBody, images: [{ url: 'no-es-una-url' }] })

            expect(response.status).toBe(400)
            expect(response.body.errors.some((e: any) => e.msg === 'La url de la imagen no es valida')).toBe(true)
        })

        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server)
                .post('/api/products')
                .send(validProductBody)

            expect(response.status).toBe(401)
        })
    })

    describe('GET /api/products (getAllProducts)', () => {
        it('debe responder 200 con la lista de productos visibles', async () => {
            (Product.find as jest.Mock).mockReturnValue(mockQuery(Promise.resolve([{ name: 'Producto 1' }])))

            const response = await request(server).get('/api/products')

            expect(response.status).toBe(200)
            expect(Product.find).toHaveBeenCalledWith({ show: true, isActive: true })
            expect(response.body).toHaveLength(1)
        })

        it('debe responder 500 si Product.find falla', async () => {
            (Product.find as jest.Mock).mockReturnValue(mockQuery(Promise.reject(new Error('fallo de conexion'))))

            const response = await request(server).get('/api/products')

            expect(response.status).toBe(500)
        })

        it('debe filtrar por coincidencia parcial (contiene) cuando se envia el query param q', async () => {
            (Product.find as jest.Mock).mockReturnValue(mockQuery(Promise.resolve([])))

            const response = await request(server).get('/api/products?q=perfume')

            expect(response.status).toBe(200)
            expect(Product.find).toHaveBeenCalledWith({
                show: true,
                isActive: true,
                $or: [{ name: /perfume/i }, { description: /perfume/i }, { tags: /perfume/i }]
            })
        })

        it('debe escapar caracteres especiales de regex en q (no debe romper ni interpretarse como regex)', async () => {
            (Product.find as jest.Mock).mockReturnValue(mockQuery(Promise.resolve([])))

            const response = await request(server).get(`/api/products?q=${encodeURIComponent('a.b*c')}`)

            expect(response.status).toBe(200)
            const filter = (Product.find as jest.Mock).mock.calls[0][0]
            expect(filter.$or[0].name.source).toBe('a\\.b\\*c')
        })

        it('debe filtrar por categoryIds cuando se envia el query param categoryId', async () => {
            (Product.find as jest.Mock).mockReturnValue(mockQuery(Promise.resolve([])))

            const response = await request(server).get(`/api/products?categoryId=${validCategoryId}`)

            expect(response.status).toBe(200)
            expect(Product.find).toHaveBeenCalledWith({
                show: true,
                isActive: true,
                categoryIds: validCategoryId
            })
        })

        it('debe filtrar por brandId cuando se envia el query param brandId', async () => {
            (Product.find as jest.Mock).mockReturnValue(mockQuery(Promise.resolve([])))

            const response = await request(server).get(`/api/products?brandId=${validBrandId}`)

            expect(response.status).toBe(200)
            expect(Product.find).toHaveBeenCalledWith({
                show: true,
                isActive: true,
                brandId: validBrandId
            })
        })

        it('debe incluir productos inactivos cuando se envia includeInactive=true', async () => {
            (Product.find as jest.Mock).mockReturnValue(mockQuery(Promise.resolve([])))

            const response = await request(server).get('/api/products?includeInactive=true')

            expect(response.status).toBe(200)
            expect(Product.find).toHaveBeenCalledWith({ show: true })
        })

        it('debe responder 400 si categoryId no es un ObjectId valido', async () => {
            const response = await request(server).get('/api/products?categoryId=no-valido')

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('errors')
        })

        it('debe responder 400 si brandId no es un ObjectId valido', async () => {
            const response = await request(server).get('/api/products?brandId=no-valido')

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('errors')
        })
    })

    describe('GET /api/products/:id (getProductById)', () => {
        it('debe responder 400 si el id no es un ObjectId valido', async () => {
            const response = await request(server).get('/api/products/id-no-valido')

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('errors')
            expect(response.body.errors).toHaveLength(1)
            expect(response.body.errors[0]['msg']).toBe('ID no válido')

            expect(response.status).not.toEqual(200)
        })

        it('debe responder 404 si el producto no existe o esta eliminado', async () => {
            (Product.findOne as jest.Mock).mockReturnValue(mockQuery(Promise.resolve(null)))

            const response = await request(server).get(`/api/products/${validId}`)

            expect(response.status).toBe(404)
        })

        it('debe responder 200 con el producto encontrado', async () => {
            (Product.findOne as jest.Mock).mockReturnValue(mockQuery(Promise.resolve({ _id: validId, ...validProductBody })))

            const response = await request(server).get(`/api/products/${validId}`)

            expect(response.status).toBe(200)
            expect(Product.findOne).toHaveBeenCalledWith({ _id: validId, show: true })
        })

        it('debe responder 500 si Product.findOne falla', async () => {
            (Product.findOne as jest.Mock).mockReturnValue(mockQuery(Promise.reject(new Error('fallo de conexion'))))

            const response = await request(server).get(`/api/products/${validId}`)

            expect(response.status).toBe(500)
        })
    })

    describe('PUT /api/products/:id (updateProductById)', () => {
        it('debe responder 404 si el producto no existe', async () => {
            (Product.findOneAndUpdate as jest.Mock).mockResolvedValue(null)

            const response = await request(server)
                .put(`/api/products/${validId}`).set('Authorization', authHeader)
                .send({ price: 100 })

            expect(response.status).toBe(404)
        })

        it('debe responder 200 con el producto actualizado', async () => {
            (Product.findOneAndUpdate as jest.Mock).mockResolvedValue({ _id: validId, price: 100 })

            const response = await request(server)
                .put(`/api/products/${validId}`).set('Authorization', authHeader)
                .send({ price: 100 })

            expect(response.status).toBe(200)
            expect(response.body.price).toBe(100)
        })

        it('debe responder 400 si el update produce un duplicado (11000)', async () => {
            const duplicateError: any = new Error('duplicate key')
            duplicateError.code = 11000
            duplicateError.keyValue = { slug: 'cuaderno-profesional' }
            ;(Product.findOneAndUpdate as jest.Mock).mockRejectedValue(duplicateError)

            const response = await request(server)
                .put(`/api/products/${validId}`).set('Authorization', authHeader)
                .send({ slug: 'cuaderno-profesional' })

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toContain("'slug'")
        })

        it('debe responder 400 si el update dispara un ValidationError', async () => {
            const validationError: any = new Error('Validation failed')
            validationError.name = 'ValidationError'
            validationError.errors = {
                discountPrice: { message: 'discountPrice debe ser menor que price' }
            }
            ;(Product.findOneAndUpdate as jest.Mock).mockRejectedValue(validationError)

            const response = await request(server)
                .put(`/api/products/${validId}`).set('Authorization', authHeader)
                .send({ discountPrice: 10 })

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toBe('discountPrice debe ser menor que price')
        })

        it('debe responder 500 si ocurre un error inesperado al actualizar', async () => {
            (Product.findOneAndUpdate as jest.Mock).mockRejectedValue(new Error('fallo inesperado'))

            const response = await request(server)
                .put(`/api/products/${validId}`).set('Authorization', authHeader)
                .send({ price: 100 })

            expect(response.status).toBe(500)
        })

        it('debe responder 400 si el body esta vacio', async () => {
            const response = await request(server)
                .put(`/api/products/${validId}`).set('Authorization', authHeader)
                .send({})

            expect(response.status).toBe(400)
            expect(response.body.errors.some((e: any) => e.msg === 'Debes enviar al menos un campo para actualizar')).toBe(true)
        })

        it('debe responder 400 si discountPrice no es menor que price', async () => {
            const response = await request(server)
                .put(`/api/products/${validId}`).set('Authorization', authHeader)
                .send({ price: 100, discountPrice: 150 })

            expect(response.status).toBe(400)
            expect(response.body.errors.some((e: any) => e.msg === 'El precio de descuento debe ser menor que el precio')).toBe(true)
        })

        it('debe responder 400 si el brandId no corresponde a una marca existente', async () => {
            (Brand.findOne as jest.Mock).mockResolvedValue(null)

            const response = await request(server)
                .put(`/api/products/${validId}`).set('Authorization', authHeader)
                .send({ brandId: validBrandId })

            expect(response.status).toBe(400)
            expect(response.body.errors.some((e: any) => e.msg === 'La marca indicada no existe')).toBe(true)
        })

        it('debe responder 200 si el brandId corresponde a una marca existente', async () => {
            (Brand.findOne as jest.Mock).mockResolvedValue({ _id: validBrandId, show: true })
            ;(Product.findOneAndUpdate as jest.Mock).mockResolvedValue({ _id: validId, brandId: validBrandId })

            const response = await request(server)
                .put(`/api/products/${validId}`).set('Authorization', authHeader)
                .send({ brandId: validBrandId })

            expect(response.status).toBe(200)
        })

        it('debe responder 400 si alguna categoryId no corresponde a una categoria existente', async () => {
            (Category.countDocuments as jest.Mock).mockResolvedValue(0)

            const response = await request(server)
                .put(`/api/products/${validId}`).set('Authorization', authHeader)
                .send({ categoryIds: [validCategoryId] })

            expect(response.status).toBe(400)
            expect(response.body.errors.some((e: any) => e.msg === 'Una o mas categorias indicadas no existen')).toBe(true)
        })

        it('debe responder 200 si todas las categoryIds corresponden a categorias existentes', async () => {
            (Category.countDocuments as jest.Mock).mockResolvedValue(1)
            ;(Product.findOneAndUpdate as jest.Mock).mockResolvedValue({ _id: validId, categoryIds: [validCategoryId] })

            const response = await request(server)
                .put(`/api/products/${validId}`).set('Authorization', authHeader)
                .send({ categoryIds: [validCategoryId] })

            expect(response.status).toBe(200)
        })

        it('debe responder 200 si categoryIds es un arreglo vacio (sin consultar la base de datos)', async () => {
            (Product.findOneAndUpdate as jest.Mock).mockResolvedValue({ _id: validId, categoryIds: [] })

            const response = await request(server)
                .put(`/api/products/${validId}`).set('Authorization', authHeader)
                .send({ categoryIds: [] })

            expect(response.status).toBe(200)
            expect(Category.countDocuments).not.toHaveBeenCalled()
        })

        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server)
                .put(`/api/products/${validId}`)
                .send({ price: 100 })

            expect(response.status).toBe(401)
        })
    })

    describe('PATCH /api/products/:id (updateStatusProductById)', () => {
        it('debe invertir isActive y responder 200', async () => {
            const save = jest.fn().mockResolvedValue(undefined)
            ;(Product.findOne as jest.Mock).mockResolvedValue({ isActive: false, save })

            const response = await request(server).patch(`/api/products/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(200)
            expect(response.body.isActive).toBe(true)
            expect(save).toHaveBeenCalled()
        })

        it('debe responder 404 si el producto no existe', async () => {
            (Product.findOne as jest.Mock).mockResolvedValue(null)

            const response = await request(server).patch(`/api/products/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(404)
        })

        it('debe responder 400 si el id no es un ObjectId valido', async () => {
            const response = await request(server).get('/api/products/id-no-valido')

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('errors')
            expect(response.body.errors).toHaveLength(1)
            expect(response.body.errors[0]['msg']).toBe('ID no válido')

            expect(response.status).not.toEqual(200)
        })

        it('debe responder 500 si ocurre un error inesperado', async () => {
            (Product.findOne as jest.Mock).mockRejectedValue(new Error('fallo inesperado'))

            const response = await request(server).patch(`/api/products/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(500)
        })

        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server).patch(`/api/products/${validId}`)

            expect(response.status).toBe(401)
        })
    })

    describe('DELETE /api/products/:id (deleteProductById)', () => {
        it('debe marcar show en false y responder 200', async () => {
            const save = jest.fn().mockResolvedValue(undefined)
            const product = { show: true, save }
            ;(Product.findOne as jest.Mock).mockResolvedValue(product)

            const response = await request(server).delete(`/api/products/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(200)
            expect(product.show).toBe(false)
            expect(save).toHaveBeenCalled()
        })

        it('debe responder 404 si el producto ya no existe', async () => {
            (Product.findOne as jest.Mock).mockResolvedValue(null)

            const response = await request(server).delete(`/api/products/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(404)
        })

        it('debe responder 400 si el id no es un ObjectId valido', async () => {
            const response = await request(server).get('/api/products/id-no-valido')

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('errors')
            expect(response.body.errors).toHaveLength(1)
            expect(response.body.errors[0]['msg']).toBe('ID no válido')

            expect(response.status).not.toEqual(200)
        })

        it('debe responder 500 si ocurre un error inesperado', async () => {
            (Product.findOne as jest.Mock).mockRejectedValue(new Error('fallo inesperado'))

            const response = await request(server).delete(`/api/products/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(500)
        })

        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server).delete(`/api/products/${validId}`)

            expect(response.status).toBe(401)
        })
    })

})
