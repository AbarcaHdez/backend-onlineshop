import type { Request, Response } from 'express'
import Product from '../models/Product'

export class ProductController {

    static createProduct = async (req: Request, res: Response) => {
        const product = new Product(req.body)
        try {
            await product.save()
            res.status(201).json(product)
        } catch (error: any) {
            if (error.code === 11000) {
                const field = Object.keys(error.keyValue)[0]
                return res.status(400).json({
                    errors: [{ msg: `El valor de '${field}' ya esta en uso` }]
                })
            }

            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((err: any) => ({
                    msg: err.message
                }))
                return res.status(400).json({ errors })
            }

            console.log(error)
            res.status(500).json({
                errors: [{ msg: 'Hubo un error al crear el producto' }]
            })
        }
    }

    static getAllProducts = async (req: Request, res: Response) => {
        const { q, categoryId, brandId } = req.query
        try {
            const filter: any = {
                show: true,
                isActive: true
            }
            if(q) filter.$text = { $search: q as string }
            if(categoryId) filter.categoryIds = categoryId
            if(brandId) filter.brandId = brandId

            const products = await Product.find(filter)
                .populate('brandId')
                .populate('categoryIds')
            res.json(products)
        } catch (error) {
            console.log(error)
            res.status(500).json({
                errors: [{ msg: 'Hubo un error al obtener los productos' }]
            })
        }
    }

    static getProductById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const product = await Product.findOne({ _id: id, show: true })
                .populate('brandId')
                .populate('categoryIds')
            if(!product) {
                const error = new Error('Producto no encontrado')
                return res.status(404).json({error: error.message})
            }
            res.json(product)
        } catch (error) {
            console.log(error)
            res.status(500).json({
                errors: [{ msg: 'Hubo un error al obtener el producto' }]
            })
        }
    }

    static updateProductById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const product = await Product.findOneAndUpdate({ _id: id, show: true }, req.body, {
                returnDocument: 'after',
                runValidators: true,
                context: 'query'
            })
            if(!product) {
                const error = new Error('Producto no encontrado')
                return res.status(404).json({error: error.message})
            }
            res.status(200).json(product)
        } catch (error: any) {
            if (error.code === 11000) {
                const field = Object.keys(error.keyValue)[0]
                return res.status(400).json({
                    errors: [{ msg: `El valor de '${field}' ya esta en uso` }]
                })
            }

            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((err: any) => ({
                    msg: err.message
                }))
                return res.status(400).json({ errors })
            }

            console.log(error)
            res.status(500).json({
                errors: [{ msg: 'Hubo un error al actualizar el producto' }]
            })
        }
    }

    static updateStatusProductById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const product = await Product.findOne({ _id: id, show: true })
            if(!product) {
                const error = new Error('Producto no encontrado')
                return res.status(404).json({error: error.message})
            }
            product.isActive = !product.isActive
            await product.save()
            return res.status(200).json(product)
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                errors: [{ msg: 'Hubo un error al actualizar el status del producto' }]
            })
        }
    }

    static deleteProductById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const product = await Product.findOne({ _id: id, show: true })
            if(!product) {
                const error = new Error('Producto no encontrado')
                return res.status(404).json({error: error.message})
            }
            product.show = false
            await product.save()
            return res.status(200).json({ msg: 'Producto eliminado correctamente' })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                errors: [{ msg: 'Hubo un error al eliminar el producto' }]
            })
        }
    }

}