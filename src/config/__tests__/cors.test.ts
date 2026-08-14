describe('corsOptions', () => {

    const originalFrontendUrl = process.env.FRONTEND_URL

    afterEach(() => {
        process.env.FRONTEND_URL = originalFrontendUrl
        jest.resetModules()
    })

    it('debe permitir requests sin origin (Postman, curl, apps moviles)', async () => {
        delete process.env.FRONTEND_URL
        jest.resetModules()
        const { corsOptions } = await import('../cors')

        const callback = jest.fn()
        ;(corsOptions.origin as any)(undefined, callback)

        expect(callback).toHaveBeenCalledWith(null, true)
    })

    it('debe permitir cualquier origen si FRONTEND_URL no esta configurada', async () => {
        delete process.env.FRONTEND_URL
        jest.resetModules()
        const { corsOptions } = await import('../cors')

        const callback = jest.fn()
        ;(corsOptions.origin as any)('http://cualquier-origen.com', callback)

        expect(callback).toHaveBeenCalledWith(null, true)
    })

    it('debe permitir el origen si coincide con FRONTEND_URL', async () => {
        process.env.FRONTEND_URL = 'https://mitienda.com'
        jest.resetModules()
        const { corsOptions } = await import('../cors')

        const callback = jest.fn()
        ;(corsOptions.origin as any)('https://mitienda.com', callback)

        expect(callback).toHaveBeenCalledWith(null, true)
    })

    it('debe permitir varios origenes si FRONTEND_URL los lista separados por coma', async () => {
        process.env.FRONTEND_URL = 'https://mitienda.com, https://admin.mitienda.com'
        jest.resetModules()
        const { corsOptions } = await import('../cors')

        const callback = jest.fn()
        ;(corsOptions.origin as any)('https://admin.mitienda.com', callback)

        expect(callback).toHaveBeenCalledWith(null, true)
    })

    it('debe rechazar el origen si FRONTEND_URL esta configurada y no coincide', async () => {
        process.env.FRONTEND_URL = 'https://mitienda.com'
        jest.resetModules()
        const { corsOptions } = await import('../cors')

        const callback = jest.fn()
        ;(corsOptions.origin as any)('https://otro-sitio.com', callback)

        expect(callback).toHaveBeenCalledWith(expect.any(Error))
    })

})
