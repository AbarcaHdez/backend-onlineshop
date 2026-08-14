import mongoose from 'mongoose'
import colors from 'colors'
import { exit } from 'node:process';
import bcrypt from 'bcryptjs'
import Admin from '../models/Admin'

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.DATABASE_URL)
        const url = `${connection.connection.host}:${connection.connection.port}`
        console.log(colors.magenta.bold(`MongoDB conectado en: ${url}`))
        await createInitialAdmin()
    } catch (error) {
        //console.log(error.message)
        console.log(colors.red.bold('Error al conectar a MongoDB'))
        exit(1)
    }
}

// Bootstrap: si todavia no hay ningun admin en esta base de datos, se crea uno
// a partir de ADMIN_EMAIL/ADMIN_PASSWORD del .env. No hay endpoint publico de
// registro, asi que esta es la unica forma de que exista la primera cuenta.
const createInitialAdmin = async () => {
    try {
        const adminCount = await Admin.countDocuments()
        if (adminCount > 0) return

        const email = process.env.ADMIN_EMAIL
        const password = process.env.ADMIN_PASSWORD
        if (!email || !password) {
            console.log(colors.yellow.bold('ADMIN_EMAIL/ADMIN_PASSWORD no configurados: no se creo el admin inicial'))
            return
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        await Admin.create({ email, password: hashedPassword })
        console.log(colors.green.bold(`Admin inicial creado: ${email}`))
    } catch (error) {
        console.log(colors.red.bold('Error al crear el admin inicial'))
    }
}