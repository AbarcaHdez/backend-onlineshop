import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { connectDB } from '../db'
import Admin from '../../models/Admin'

jest.mock('mongoose')
jest.mock('bcryptjs')

jest.mock('../../models/Admin', () => {
    return {
        __esModule: true,
        default: {
            countDocuments: jest.fn(),
            create: jest.fn()
        }
    }
})

describe('connectDB', () => {

    const originalEmail = process.env.ADMIN_EMAIL
    const originalPassword = process.env.ADMIN_PASSWORD

    afterEach(() => {
        jest.restoreAllMocks()
        jest.clearAllMocks()
        process.env.ADMIN_EMAIL = originalEmail
        process.env.ADMIN_PASSWORD = originalPassword
    })

    it('debe conectar exitosamente a la base de datos', async () => {
        const connectSpy = jest.spyOn(mongoose, 'connect').mockResolvedValueOnce({
            connection: { host: '127.0.0.1', port: 27017 }
        } as any)
        const consoleLogSpy = jest.spyOn(console, 'log')
        ;(Admin.countDocuments as jest.Mock).mockResolvedValue(1)

        await connectDB()

        expect(connectSpy).toHaveBeenCalledWith(process.env.DATABASE_URL)
        expect(consoleLogSpy).toHaveBeenCalled()
        expect(consoleLogSpy.mock.calls[0][0]).toContain('MongoDB conectado en: 127.0.0.1:27017')
    })

    it('debe finalizar el proceso si la conexion falla', async () => {
        jest.spyOn(mongoose, 'connect').mockRejectedValueOnce(new Error('fallo de conexion'))
        const consoleLogSpy = jest.spyOn(console, 'log')
        const exitSpy = jest.spyOn(process, 'exit').mockImplementation((() => undefined) as any)

        await connectDB()

        expect(consoleLogSpy.mock.calls[0][0]).toContain('Error al conectar a MongoDB')
        expect(exitSpy).toHaveBeenCalledWith(1)
    })

    describe('createInitialAdmin (bootstrap, disparado dentro de connectDB)', () => {

        beforeEach(() => {
            jest.spyOn(mongoose, 'connect').mockResolvedValue({
                connection: { host: '127.0.0.1', port: 27017 }
            } as any)
        })

        it('no crea nada si ya existe un admin', async () => {
            (Admin.countDocuments as jest.Mock).mockResolvedValue(1)

            await connectDB()

            expect(Admin.create).not.toHaveBeenCalled()
        })

        it('no crea nada y avisa si faltan ADMIN_EMAIL/ADMIN_PASSWORD', async () => {
            (Admin.countDocuments as jest.Mock).mockResolvedValue(0)
            delete process.env.ADMIN_EMAIL
            delete process.env.ADMIN_PASSWORD
            const consoleLogSpy = jest.spyOn(console, 'log')

            await connectDB()

            expect(Admin.create).not.toHaveBeenCalled()
            expect(consoleLogSpy.mock.calls.some(call =>
                call[0].includes('ADMIN_EMAIL/ADMIN_PASSWORD no configurados')
            )).toBe(true)
        })

        it('crea el admin inicial con el password hasheado si no existe ninguno', async () => {
            (Admin.countDocuments as jest.Mock).mockResolvedValue(0)
            process.env.ADMIN_EMAIL = 'admin@ejemplo.com'
            process.env.ADMIN_PASSWORD = 'password123'
            ;(bcrypt.hash as jest.Mock).mockResolvedValue('hash-generado')
            const consoleLogSpy = jest.spyOn(console, 'log')

            await connectDB()

            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10)
            expect(Admin.create).toHaveBeenCalledWith({ email: 'admin@ejemplo.com', password: 'hash-generado' })
            expect(consoleLogSpy.mock.calls.some(call =>
                call[0].includes('Admin inicial creado')
            )).toBe(true)
        })

        it('no interrumpe la conexion si falla la creacion del admin inicial', async () => {
            (Admin.countDocuments as jest.Mock).mockRejectedValue(new Error('fallo inesperado'))
            const consoleLogSpy = jest.spyOn(console, 'log')

            await connectDB()

            expect(consoleLogSpy.mock.calls.some(call =>
                call[0].includes('Error al crear el admin inicial')
            )).toBe(true)
        })

    })

})
