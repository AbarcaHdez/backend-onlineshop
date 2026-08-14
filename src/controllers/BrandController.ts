import type { Request, Response } from 'express'
import Brand from '../models/Brand'

export class BrandController {

    static createBrand = async (req: Request, res: Response) => {
        const brand = new Brand(req.body)
        try {
            await brand.save()
            res.status(201).json(brand)
        } catch (error :any) {
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
                errors: [{ msg: 'Hubo un error al crear la marca' }]
            })
        }
    }

    static getAllBrands = async (req: Request, res: Response) => {
        try {
            const brands = await Brand.find({ show: true })
            res.json(brands)
        } catch (error) {
            console.log(error)
            res.status(500).json({
                errors: [{ msg: 'Hubo un error al obtener las marcas'}]
            })
        }
    }

    static getBrandById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const brand = await Brand.findOne({ _id: id, show: true })
            if(!brand) {
                const error = new Error('Marca no encontrada')
                return res.status(404).json({error: error.message})
            }
            res.json(brand)
        } catch (error) {
            console.log(error)
            res.status(500).json({
                errors: [{ msg: 'Hubo un error al obtener la marca' }]
            })
        }
    }

    static updateBrandById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const brand = await Brand.findOneAndUpdate({ _id: id, show: true }, req.body, {
                returnDocument: 'after',
                runValidators: true,
                context: 'query'
            })
            if(!brand) {
                const error = new Error('Marca no encontrada')
                return res.status(404).json({error: error.message})
            }
            res.status(200).json(brand)
        } catch (error :any) {
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
                errors: [{ msg: 'Hubo un error al actualizar la marca' }]
            })
        }
    }

    static updateStatusBrandById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const brand = await Brand.findOne({ _id: id, show: true })
            if(!brand) {
                const error = new Error('Marca no encontrada')
                return res.status(404).json({error: error.message})
            }
            brand.isActive = !brand.isActive
            await brand.save()
            return res.status(200).json(brand)
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                errors: [{ msg: 'Hubo un error al actualizar el status de la marca'}]
            })
        }
    }

    static deleteBrandById = async (req: Request, res: Response) => {
        const {id} = req.params
        try {
            const brand = await Brand.findOne({ _id: id, show: true })
            if(!brand) {
                const error = new Error('Marca no encontrada')
                return res.status(404).json({error: error.message})
            }
            brand.show = false
            await brand.save()
            return res.status(200).json({ msg: 'Marca eliminada correctamente' })
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                errors: [{ msg: 'Hubo un error al eliminar la marca' }]
            })
        }
    }

}