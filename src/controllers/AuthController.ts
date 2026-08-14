import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin'

export class AuthController {

    static login = async (req: Request, res: Response) => {
        const { email, password } = req.body
        try {
            const admin = await Admin.findOne({ email })
            if (!admin || !(await bcrypt.compare(password, admin.password))) {
                return res.status(401).json({ errors: [{ msg: 'Credenciales invalidas' }] })
            }
            const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET as string, { expiresIn: '7d' })
            res.json({ token })
        } catch (error) {
            console.log(error)
            res.status(500).json({ errors: [{ msg: 'Hubo un error al iniciar sesion' }] })
        }
    }

}