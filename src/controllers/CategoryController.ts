import type { Request, Response } from 'express'
import Category from '../models/Category'

export class CategoryController {

    static createCategory = async (req: Request, res: Response) => {
        const category = new Category(req.body)
        try {
            await category.save()
            res.status(201).json(category)
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
                errors: [{ msg: 'Hubo un error al crear la categoria' }]
            })
        }
    }

    static getAllCategories = async (req: Request, res: Response) => {
        try {
            const categories = await Category.find({ show: true })
            res.json(categories)
        } catch (error) {
            console.log(error)
            res.status(500).json({
                errors: [{ msg: 'Hubo un error al obtener las categorias' }]
            })
        }
    }

    static getCategoryById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const category = await Category.findOne({ _id: id, show: true })
            if(!category) {
                const error = new Error('Categoria no encontrada')
                return res.status(404).json({error: error.message})
            }
            res.json(category)
        } catch (error) {
            console.log(error)
            res.status(500).json({
                errors: [{ msg: 'Hubo un error al obtener la categoria' }]
            })
        }
    }

    static updateCategoryById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const category = await Category.findOneAndUpdate({ _id: id, show: true }, req.body, {
                returnDocument: 'after',
                runValidators: true,
                context: 'query'
            })
            if(!category) {
                const error = new Error('Categoria no encontrada')
                return res.status(404).json({error: error.message})
            }
            res.status(200).json(category)
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
                errors: [{ msg: 'Hubo un error al actualizar la categoria' }]
            })
        }
    }

    static updateStatusCategoryById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const category = await Category.findOne({ _id: id, show: true })
            if(!category) {
                const error = new Error('Categoria no encontrada')
                return res.status(404).json({error: error.message})
            }
            category.isActive = !category.isActive
            await category.save()
            return res.status(200).json(category)
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                errors: [{ msg: 'Hubo un error al actualizar el status de la categoria' }]
            })
        }
    }

    static deleteCategoryById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const category = await Category.findOne({ _id: id, show: true })
            if(!category) {
                const error = new Error('Categoria no encontrada')
                return res.status(404).json({error: error.message})
            }
            category.show = false
            await category.save()
            return res.status(200).json({ msg: 'Categoria eliminada correctamente' })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                errors: [{ msg: 'Hubo un error al eliminar la categoria' }]
            })
        }
    }

}
