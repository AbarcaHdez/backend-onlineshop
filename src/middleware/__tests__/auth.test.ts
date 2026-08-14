import jwt from 'jsonwebtoken'
import { authenticate } from '../auth'

jest.mock('jsonwebtoken')

describe('authenticate', () => {

    const mockRes = () => {
        const res: any = {}
        res.status = jest.fn().mockReturnValue(res)
        res.json = jest.fn().mockReturnValue(res)
        return res
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('debe responder 401 si no se envia el header Authorization', () => {
        const req: any = { header: jest.fn().mockReturnValue(undefined) }
        const res = mockRes()
        const next = jest.fn()

        authenticate(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: 'No autorizado' }] })
        expect(next).not.toHaveBeenCalled()
    })

    it('debe responder 401 si el header no tiene el formato "Bearer <token>"', () => {
        const req: any = { header: jest.fn().mockReturnValue('Token abc123') }
        const res = mockRes()
        const next = jest.fn()

        authenticate(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(next).not.toHaveBeenCalled()
    })

    it('debe responder 401 si el token es invalido o expiro', () => {
        (jwt.verify as jest.Mock).mockImplementation(() => {
            throw new Error('jwt expired')
        })
        const req: any = { header: jest.fn().mockReturnValue('Bearer token-invalido') }
        const res = mockRes()
        const next = jest.fn()

        authenticate(req, res, next)

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({ errors: [{ msg: 'Token invalido o expirado' }] })
        expect(next).not.toHaveBeenCalled()
    })

    it('debe llamar a next si el token es valido', () => {
        (jwt.verify as jest.Mock).mockReturnValue({ id: 'admin-id' })
        const req: any = { header: jest.fn().mockReturnValue('Bearer token-valido') }
        const res = mockRes()
        const next = jest.fn()

        authenticate(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(res.status).not.toHaveBeenCalled()
    })

})
