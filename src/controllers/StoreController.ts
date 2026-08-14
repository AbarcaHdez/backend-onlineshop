import type { Request, Response } from 'express'
import Store from '../models/Store'

export class StoreController {

    static getStore = async (req: Request, res: Response) => {
        try {
            const store = await Store.findOneAndUpdate({}, {}, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            })
            res.json(store)
        } catch (error) {
            console.log(error)
            res.status(500).json({ errors: [{ msg: 'Hubo un error al obtener la configuracion de la tienda' }] })
        }
    }

    static updateStore = async (req: Request, res: Response) => {
        try {
            const store = await Store.findOneAndUpdate({}, req.body, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                runValidators: true,
                context: 'query'
            })
            res.status(200).json(store)
        } catch (error: any) {
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map((err: any) => ({ msg: err.message }))
                return res.status(400).json({ errors })
            }
            console.log(error)
            res.status(500).json({ errors: [{ msg: 'Hubo un error al actualizar la configuracion de la tienda' }] })
        }
    }

}