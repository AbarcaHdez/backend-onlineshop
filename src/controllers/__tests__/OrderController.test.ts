import request from 'supertest'
import server from '../../server'
import Order from '../../models/Order'
import Product from '../../models/Product'
import Store from '../../models/Store'
import jwt from 'jsonwebtoken'

jest.mock('../../config/db')

jest.mock('jsonwebtoken')

jest.mock('../../models/Order', () => {
    const mockOrder = jest.fn()
    return {
        __esModule: true,
        default: Object.assign(mockOrder, {
            find: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn()
        })
    }
})

jest.mock('../../models/Product', () => {
    return {
        __esModule: true,
        default: {
            find: jest.fn()
        }
    }
})

jest.mock('../../models/Store', () => {
    return {
        __esModule: true,
        default: {
            findOneAndUpdate: jest.fn()
        }
    }
})

const validId = '64f1a2b3c4d5e6f7a8b9c0d1'
const productId1 = '64f1a2b3c4d5e6f7a8b9c0d2'
const productId2 = '64f1a2b3c4d5e6f7a8b9c0d3'
const authHeader = 'Bearer test-token'

// getAllOrders encadena .sort() sobre el resultado de Order.find(), asi que el
// mock debe simular una Query de Mongoose: un objeto "thenable" con .sort() encadenable.
const mockSortQuery = (promise: Promise<unknown>) => {
    const query: any = {
        sort: jest.fn(() => query),
        then: (onFulfilled?: any, onRejected?: any) => promise.then(onFulfilled, onRejected)
    }
    return query
}

const product1 = { _id: productId1, name: 'Perfume Dior Sauvage', price: 1000 }
const product2 = { _id: productId2, name: 'Gorra Nike', price: 350, discountPrice: 300 }

const validOrderBody = {
    customerName: 'Juan',
    items: [
        { productId: productId1, quantity: 2 },
        { productId: productId2, quantity: 1 }
    ]
}

const mockOrderSave = () => {
    const save = jest.fn().mockResolvedValue(undefined)
    ;(Order as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
        Object.assign(this, data, { save })
        return this
    })
    return save
}

describe('OrderController', () => {

    beforeEach(() => {
        (jwt.verify as jest.Mock).mockReturnValue({ id: 'admin-id' })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('POST /api/orders (createOrder)', () => {
        it('debe responder 400 si customerName no se envia', async () => {
            const response = await request(server).post('/api/orders').send({ items: validOrderBody.items })

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('errors')
        })

        it('debe responder 400 si items esta vacio', async () => {
            const response = await request(server).post('/api/orders').send({ customerName: 'Juan', items: [] })

            expect(response.status).toBe(400)
            expect(response.body.errors.some((e: any) => e.msg === 'El pedido debe tener al menos un producto')).toBe(true)
        })

        it('debe responder 400 si algun productId no es un ObjectId valido', async () => {
            const response = await request(server)
                .post('/api/orders')
                .send({ customerName: 'Juan', items: [{ productId: 'no-valido', quantity: 1 }] })

            expect(response.status).toBe(400)
        })

        it('debe responder 400 si la cantidad de algun item no es un entero mayor a 0', async () => {
            const response = await request(server)
                .post('/api/orders')
                .send({ customerName: 'Juan', items: [{ productId: productId1, quantity: 0 }] })

            expect(response.status).toBe(400)
        })

        it('debe responder 400 si algun producto no existe o no esta disponible', async () => {
            (Product.find as jest.Mock).mockResolvedValue([product1])

            const response = await request(server).post('/api/orders').send(validOrderBody)

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toBe('Uno o mas productos indicados no existen o no estan disponibles')
        })

        it('debe crear el pedido, calcular el total con los precios reales y responder 201', async () => {
            (Product.find as jest.Mock).mockResolvedValue([product1, product2])
            const save = mockOrderSave()
            ;(Store.findOneAndUpdate as jest.Mock).mockResolvedValue({ whatsappNumber: '+52 123 456 7890', currency: 'MXN' })

            const response = await request(server).post('/api/orders').send(validOrderBody)

            expect(response.status).toBe(201)
            expect(response.body.order.customerName).toBe('Juan')
            expect(response.body.order.total).toBe(2 * 1000 + 1 * 300)
            expect(save).toHaveBeenCalled()
            expect(response.body.whatsappUrl).toContain('https://wa.me/521234567890?text=')
        })

        it('debe usar discountPrice en vez de price cuando este presente', async () => {
            (Product.find as jest.Mock).mockResolvedValue([product2])
            mockOrderSave()
            ;(Store.findOneAndUpdate as jest.Mock).mockResolvedValue({ whatsappNumber: '', currency: 'MXN' })

            const response = await request(server)
                .post('/api/orders')
                .send({ customerName: 'Juan', items: [{ productId: productId2, quantity: 1 }] })

            expect(response.status).toBe(201)
            expect(response.body.order.items[0].price).toBe(300)
        })

        it('debe responder 400 si Mongoose lanza un ValidationError al guardar', async () => {
            (Product.find as jest.Mock).mockResolvedValue([product1, product2])

            const validationError: any = new Error('Validation failed')
            validationError.name = 'ValidationError'
            validationError.errors = {
                customerName: { message: 'El nombre del cliente es obligatorio' }
            }
            ;(Order as unknown as jest.Mock).mockImplementation(function (this: any, data: any) {
                Object.assign(this, data, { save: jest.fn().mockRejectedValue(validationError) })
                return this
            })

            const response = await request(server).post('/api/orders').send(validOrderBody)

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toBe('El nombre del cliente es obligatorio')
        })

        it('debe responder 500 si ocurre un error inesperado', async () => {
            (Product.find as jest.Mock).mockRejectedValue(new Error('fallo inesperado'))

            const response = await request(server).post('/api/orders').send(validOrderBody)

            expect(response.status).toBe(500)
            expect(response.body.errors[0].msg).toBe('Hubo un error al crear el pedido')
        })
    })

    describe('GET /api/orders (getAllOrders)', () => {
        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server).get('/api/orders')

            expect(response.status).toBe(401)
        })

        it('debe responder 200 con la lista de pedidos', async () => {
            (Order.find as jest.Mock).mockReturnValue(mockSortQuery(Promise.resolve([{ customerName: 'Juan' }])))

            const response = await request(server).get('/api/orders').set('Authorization', authHeader)

            expect(response.status).toBe(200)
            expect(Order.find).toHaveBeenCalledWith({})
            expect(response.body).toHaveLength(1)
        })

        it('debe filtrar por status cuando se envia el query param', async () => {
            (Order.find as jest.Mock).mockReturnValue(mockSortQuery(Promise.resolve([])))

            const response = await request(server).get('/api/orders?status=pending').set('Authorization', authHeader)

            expect(response.status).toBe(200)
            expect(Order.find).toHaveBeenCalledWith({ status: 'pending' })
        })

        it('debe responder 400 si status no es un valor valido', async () => {
            const response = await request(server).get('/api/orders?status=no-valido').set('Authorization', authHeader)

            expect(response.status).toBe(400)
        })

        it('debe responder 500 si Order.find falla', async () => {
            (Order.find as jest.Mock).mockReturnValue(mockSortQuery(Promise.reject(new Error('fallo de conexion'))))

            const response = await request(server).get('/api/orders').set('Authorization', authHeader)

            expect(response.status).toBe(500)
        })
    })

    describe('GET /api/orders/:id (getOrderById)', () => {
        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server).get(`/api/orders/${validId}`)

            expect(response.status).toBe(401)
        })

        it('debe responder 400 si el id no es un ObjectId valido', async () => {
            const response = await request(server).get('/api/orders/id-no-valido').set('Authorization', authHeader)

            expect(response.status).toBe(400)
        })

        it('debe responder 404 si el pedido no existe', async () => {
            (Order.findOne as jest.Mock).mockResolvedValue(null)

            const response = await request(server).get(`/api/orders/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(404)
            expect(response.body.error).toBe('Pedido no encontrado')
        })

        it('debe responder 200 con el pedido encontrado', async () => {
            (Order.findOne as jest.Mock).mockResolvedValue({ _id: validId, customerName: 'Juan' })

            const response = await request(server).get(`/api/orders/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(200)
            expect(Order.findOne).toHaveBeenCalledWith({ _id: validId })
        })

        it('debe responder 500 si Order.findOne falla', async () => {
            (Order.findOne as jest.Mock).mockRejectedValue(new Error('fallo inesperado'))

            const response = await request(server).get(`/api/orders/${validId}`).set('Authorization', authHeader)

            expect(response.status).toBe(500)
        })
    })

    describe('PATCH /api/orders/:id (updateOrderStatus)', () => {
        it('debe responder 401 si no se envia el token de autorizacion', async () => {
            const response = await request(server).patch(`/api/orders/${validId}`).send({ status: 'completed' })

            expect(response.status).toBe(401)
        })

        it('debe responder 400 si el id no es un ObjectId valido', async () => {
            const response = await request(server)
                .patch('/api/orders/id-no-valido').set('Authorization', authHeader)
                .send({ status: 'completed' })

            expect(response.status).toBe(400)
        })

        it('debe responder 400 si status no se envia', async () => {
            const response = await request(server)
                .patch(`/api/orders/${validId}`).set('Authorization', authHeader)
                .send({})

            expect(response.status).toBe(400)
        })

        it('debe responder 400 si status no es un valor valido', async () => {
            const response = await request(server)
                .patch(`/api/orders/${validId}`).set('Authorization', authHeader)
                .send({ status: 'no-valido' })

            expect(response.status).toBe(400)
        })

        it('debe responder 404 si el pedido no existe', async () => {
            (Order.findByIdAndUpdate as jest.Mock).mockResolvedValue(null)

            const response = await request(server)
                .patch(`/api/orders/${validId}`).set('Authorization', authHeader)
                .send({ status: 'completed' })

            expect(response.status).toBe(404)
            expect(response.body.error).toBe('Pedido no encontrado')
        })

        it('debe actualizar el status y responder 200', async () => {
            (Order.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: validId, status: 'completed' })

            const response = await request(server)
                .patch(`/api/orders/${validId}`).set('Authorization', authHeader)
                .send({ status: 'completed' })

            expect(response.status).toBe(200)
            expect(response.body.status).toBe('completed')
            expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(validId, { status: 'completed' }, {
                returnDocument: 'after',
                runValidators: true,
                context: 'query'
            })
        })

        it('debe responder 400 si Mongoose lanza un ValidationError al actualizar', async () => {
            const validationError: any = new Error('Validation failed')
            validationError.name = 'ValidationError'
            validationError.errors = {
                status: { message: 'status no es valido' }
            }
            ;(Order.findByIdAndUpdate as jest.Mock).mockRejectedValue(validationError)

            const response = await request(server)
                .patch(`/api/orders/${validId}`).set('Authorization', authHeader)
                .send({ status: 'completed' })

            expect(response.status).toBe(400)
            expect(response.body.errors[0].msg).toBe('status no es valido')
        })

        it('debe responder 500 si ocurre un error inesperado', async () => {
            (Order.findByIdAndUpdate as jest.Mock).mockRejectedValue(new Error('fallo inesperado'))

            const response = await request(server)
                .patch(`/api/orders/${validId}`).set('Authorization', authHeader)
                .send({ status: 'completed' })

            expect(response.status).toBe(500)
        })
    })

})
