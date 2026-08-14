import Product from '../Product'

const validBaseData = {
    name: 'Cuaderno Profesional',
    slug: 'cuaderno-profesional',
    price: 65,
    sku: 'PAP-CUAD-001'
}

describe('Product - validador de discountPrice', () => {

    it('no debe marcar error si no se envia discountPrice', () => {
        const product = new Product(validBaseData)

        const error = product.validateSync()

        expect(error?.errors.discountPrice).toBeUndefined()
    })

    it('no debe marcar error si discountPrice es menor que price', () => {
        const product = new Product({ ...validBaseData, discountPrice: 50 })

        const error = product.validateSync()

        expect(error?.errors.discountPrice).toBeUndefined()
    })

    it('debe marcar error si discountPrice es igual o mayor que price', () => {
        const product = new Product({ ...validBaseData, discountPrice: 65 })

        const error = product.validateSync()

        expect(error?.errors.discountPrice).toBeDefined()
        expect(error?.errors.discountPrice.message).toBe('discountPrice debe ser menor que price')
    })

})
