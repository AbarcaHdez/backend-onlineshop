import type { Request, Response } from 'express'
import Order from '../models/Order'
import Product from '../models/Product'
import Store from '../models/Store'

export class OrderController {

    // Confirma un pedido: recalcula precios y total contra los productos reales
    // (no se confia en lo que mande el cliente) y devuelve el link de WhatsApp listo para enviar
    static createOrder = async (req: Request, res: Response) => {
        const { items, customerName } = req.body
        try {
            const productIds = items.map((item: any) => item.productId)
            const uniqueProductIds = [...new Set(productIds)]

            const products = await Product.find({
                _id: { $in: uniqueProductIds as any },
                show: true,
                isActive: true
            })

            if (products.length !== uniqueProductIds.length) {
                return res.status(400).json({
                    errors: [{ msg: 'Uno o mas productos indicados no existen o no estan disponibles' }]
                })
            }

            const productsById = new Map(products.map((product: any) => [product._id.toString(), product]))

            const orderItems = items.map((item: any) => {
                const product: any = productsById.get(item.productId)
                const price = product.discountPrice ?? product.price
                return {
                    productId: product._id,
                    name: product.name,
                    price,
                    quantity: item.quantity
                }
            })

            const total = orderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

            const order = new Order({ items: orderItems, customerName, total })
            await order.save()

            const store = await Store.findOneAndUpdate({}, {}, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            })

            const lines = orderItems.map((item: any) => `• ${item.quantity} × ${item.name}`).join('\n')
            const message = `Hola, me interesa realizar el siguiente pedido:\n\n${lines}\n\nTotal aproximado: $${total} ${store.currency}\n\nMi nombre es ${customerName}.\n\nGracias.`

            const phone = (store.whatsappNumber || '').replace(/\D/g, '')
            const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

            res.status(201).json({ order, whatsappUrl })
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((err: any) => ({
                    msg: err.message
                }))
                return res.status(400).json({ errors })
            }

            console.log(error)
            res.status(500).json({
                errors: [{ msg: 'Hubo un error al crear el pedido' }]
            })
        }
    }

    static getAllOrders = async (req: Request, res: Response) => {
        const { status } = req.query
        try {
            const filter: any = {}
            if (status) filter.status = status

            const orders = await Order.find(filter).sort({ createdAt: -1 })
            res.json(orders)
        } catch (error) {
            console.log(error)
            res.status(500).json({
                errors: [{ msg: 'Hubo un error al obtener los pedidos' }]
            })
        }
    }

    static getOrderById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const order = await Order.findOne({ _id: id })
            if(!order) {
                const error = new Error('Pedido no encontrado')
                return res.status(404).json({error: error.message})
            }
            res.json(order)
        } catch (error) {
            console.log(error)
            res.status(500).json({
                errors: [{ msg: 'Hubo un error al obtener el pedido' }]
            })
        }
    }

    static updateOrderStatus = async (req: Request, res: Response) => {
        const {id} = req.params
        const {status} = req.body
        try {
            const order = await Order.findByIdAndUpdate(id, { status }, {
                returnDocument: 'after',
                runValidators: true,
                context: 'query'
            })
            if(!order) {
                const error = new Error('Pedido no encontrado')
                return res.status(404).json({error: error.message})
            }
            res.status(200).json(order)
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((err: any) => ({
                    msg: err.message
                }))
                return res.status(400).json({ errors })
            }

            console.log(error)
            res.status(500).json({
                errors: [{ msg: 'Hubo un error al actualizar el estado del pedido' }]
            })
        }
    }

}