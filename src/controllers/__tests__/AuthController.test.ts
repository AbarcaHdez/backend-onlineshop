import request from 'supertest'
import server from '../../server'
import Admin from '../../models/Admin'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

jest.mock('../../config/db')

jest.mock('../../models/Admin', () => {
    return {
        __esModule: true,
        default: {
            findOne: jest.fn()
        }
    }
})

jest.mock('bcryptjs')
jest.mock('jsonwebtoken')

const validLoginBody = {
    email: 'admin@ejemplo.com',
    password: 'password123'
}

describe('AuthController', () => {

    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('POST /api/auth/login', () => {
        it('debe responder 400 si el email no es valido', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({ email: 'no-es-un-email', password: 'password123' })

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('errors')
        })

        it('debe responder 400 si falta el password', async () => {
            const response = await request(server)
                .post('/api/auth/login')
                .send({ email: 'admin@ejemplo.com' })

            expect(response.status).toBe(400)
            expect(response.body).toHaveProperty('errors')
        })

        it('debe responder 401 si el admin no existe', async () => {
            (Admin.findOne as jest.Mock).mockResolvedValue(null)

            const response = await request(server)
                .post('/api/auth/login')
                .send(validLoginBody)

            expect(response.status).toBe(401)
            expect(response.body.errors[0].msg).toBe('Credenciales invalidas')
            expect(bcrypt.compare).not.toHaveBeenCalled()
        })

        it('debe responder 401 si el password no coincide', async () => {
            (Admin.findOne as jest.Mock).mockResolvedValue({ _id: 'admin-id', password: 'hash-guardado' })
            ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

            const response = await request(server)
                .post('/api/auth/login')
                .send(validLoginBody)

            expect(response.status).toBe(401)
            expect(response.body.errors[0].msg).toBe('Credenciales invalidas')
        })

        it('debe responder 200 con un token si las credenciales son correctas', async () => {
            (Admin.findOne as jest.Mock).mockResolvedValue({ _id: 'admin-id', password: 'hash-guardado' })
            ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
            ;(jwt.sign as jest.Mock).mockReturnValue('fake-jwt-token')

            const response = await request(server)
                .post('/api/auth/login')
                .send(validLoginBody)

            expect(response.status).toBe(200)
            expect(response.body.token).toBe('fake-jwt-token')
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 'admin-id' },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            )
        })

        it('debe responder 500 si ocurre un error inesperado', async () => {
            (Admin.findOne as jest.Mock).mockRejectedValue(new Error('fallo de conexion'))

            const response = await request(server)
                .post('/api/auth/login')
                .send(validLoginBody)

            expect(response.status).toBe(500)
            expect(response.body.errors[0].msg).toBe('Hubo un error al iniciar sesion')
        })
    })

})
