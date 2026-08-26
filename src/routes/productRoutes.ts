import { Router } from 'express'
import { body, param, query } from 'express-validator'
import { ProductController } from '../controllers/ProductController'
import { handleInputErrors, isValidUrl } from '../middleware/validation'
import Brand from '../models/Brand'
import Category from '../models/Category'
import { authenticate } from '../middleware/auth'

const router = Router()

//Crea un nuevo producto
router.post('/',
    authenticate,
    body('name')
        .notEmpty().withMessage('El nombre del producto es obligatorio')
        .isString().withMessage('El nombre debe ser texto')
        .trim(),

    body('slug')
        .notEmpty().withMessage('El slug es obligatorio')
        .isSlug().withMessage('El slug solo puede contener letras minusculas, numeros y guiones')
        .trim(),

    body('description')
        .optional()
        .isString().withMessage('La descripcion debe ser texto'),

    body('price')
        .notEmpty().withMessage('El precio es obligatorio')
        .isFloat({ min: 0 }).withMessage('El precio debe ser un numero mayor o igual a 0'),

    body('discountPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('El precio de descuento debe ser un numero mayor o igual a 0')
        .custom((value, { req }) => {
            if (req.body.price !== undefined && Number(value) >= Number(req.body.price)) {
                throw new Error('El precio de descuento debe ser menor que el precio')
            }
            return true
        }),

    body('sku')
        .optional()
        .isString().withMessage('El SKU debe ser texto')
        .trim(),

    body('brandId')
        .optional({ nullable: true })
        .isMongoId().withMessage('El brandId debe ser un id valido')
        .custom(async (value) => {
            const brand = await Brand.findOne({ _id: value, show: true })
            if (!brand) {
                throw new Error('La marca indicada no existe')
            }
            return true
        }),

    body('categoryIds')
        .optional()
        .isArray().withMessage('categoryIds debe ser un arreglo')
        .custom(async (value) => {
            if (value.length === 0) return true
            const count = await Category.countDocuments({ _id: { $in: value }, show: true })
            if (count !== value.length) {
                throw new Error('Una o mas categorias indicadas no existen')
            }
            return true
        }),
    body('categoryIds.*')
        .isMongoId().withMessage('Cada categoryId debe ser un id valido'),

    body('images')
        .optional()
        .isArray().withMessage('images debe ser un arreglo'),
    body('images.*.url')
        .notEmpty().withMessage('Cada imagen debe tener una url')
        .custom((value) => {
            if (!isValidUrl(value)) {
                throw new Error('La url de la imagen no es valida')
            }
            return true
        }),

    body('variants')
        .optional()
        .isArray().withMessage('variants debe ser un arreglo'),
    body('variants.*.sku')
        .notEmpty().withMessage('Cada variante debe tener un sku'),
    body('variants.*.price')
        .isFloat({ min: 0 }).withMessage('El precio de la variante debe ser mayor o igual a 0'),

    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive debe ser true o false'),

    body('tags')
        .optional()
        .isArray().withMessage('tags debe ser un arreglo'),
    body('tags.*')
        .isString().withMessage('Cada tag debe ser texto'),

    handleInputErrors,
    ProductController.createProduct
)

//Obtiene todos los productos visibles del catálago
router.get('/', 
    query('q')
        .optional()
        .isString().withMessage('q debe ser texto'),

    query('categoryId')
        .optional()
        .isMongoId().withMessage('categoryId debe ser un id válido'),
    
    query('brandId')
        .optional()
        .isMongoId().withMessage('brandId debe ser un id válido'),

    query('includeInactive')
        .optional()
        .isBoolean().withMessage('includeInactive debe ser true o false'),

    handleInputErrors,
    ProductController.getAllProducts
)

//Obtiene un producto por su ID
router.get('/:id',
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    ProductController.getProductById
)

//Actualiza un producto
router.put('/:id',
    authenticate,
    param('id').isMongoId().withMessage('ID no válido'),

    body().custom((value, { req }) => {
        if (Object.keys(req.body).length === 0) {
            throw new Error('Debes enviar al menos un campo para actualizar')
        }
        return true
    }),

    body('name')
        .optional()
        .notEmpty().withMessage('El nombre del producto no puede estar vacio')
        .isString().withMessage('El nombre debe ser texto')
        .trim(),

    body('slug')
        .optional()
        .notEmpty().withMessage('El slug no puede estar vacio')
        .isSlug().withMessage('El slug solo puede contener letras minusculas, numeros y guiones')
        .trim(),

    body('description')
        .optional()
        .isString().withMessage('La descripcion debe ser texto'),

    body('price')
        .optional()
        .isFloat({ min: 0 }).withMessage('El precio debe ser un numero mayor o igual a 0'),

    body('discountPrice')
        .optional()
        .isFloat({ min: 0 }).withMessage('El precio de descuento debe ser un numero mayor o igual a 0')
        .custom((value, { req }) => {
            if (req.body.price !== undefined && Number(value) >= Number(req.body.price)) {
                throw new Error('El precio de descuento debe ser menor que el precio')
            }
            return true
        }),

    body('sku')
        .optional()
        .notEmpty().withMessage('El SKU no puede estar vacio')
        .isString().withMessage('El SKU debe ser texto')
        .trim(),

    body('brandId')
        .optional({ nullable: true })
        .isMongoId().withMessage('El brandId debe ser un id valido')
        .custom(async (value) => {
            const brand = await Brand.findOne({ _id: value, show: true })
            if (!brand) {
                throw new Error('La marca indicada no existe')
            }
            return true
        }),

    body('categoryIds')
        .optional()
        .isArray().withMessage('categoryIds debe ser un arreglo')
        .custom(async (value) => {
            if (value.length === 0) return true
            const count = await Category.countDocuments({ _id: { $in: value }, show: true })
            if (count !== value.length) {
                throw new Error('Una o mas categorias indicadas no existen')
            }
            return true
        }),
    body('categoryIds.*')
        .isMongoId().withMessage('Cada categoryId debe ser un id valido'),

    body('images')
        .optional()
        .isArray().withMessage('images debe ser un arreglo'),
    body('images.*.url')
        .notEmpty().withMessage('Cada imagen debe tener una url')
        .custom((value) => {
            if (!isValidUrl(value)) {
                throw new Error('La url de la imagen no es valida')
            }
            return true
        }),

    body('variants')
        .optional()
        .isArray().withMessage('variants debe ser un arreglo'),
    body('variants.*.sku')
        .notEmpty().withMessage('Cada variante debe tener un sku'),
    body('variants.*.price')
        .isFloat({ min: 0 }).withMessage('El precio de la variante debe ser mayor o igual a 0'),

    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive debe ser true o false'),

    body('tags')
        .optional()
        .isArray().withMessage('tags debe ser un arreglo'),
    body('tags.*')
        .isString().withMessage('Cada tag debe ser texto'),

    handleInputErrors,
    ProductController.updateProductById
)

//Alterna el isActive por su ID (mostrar el producto en el catálago)
router.patch('/:id',
    authenticate,
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    ProductController.updateStatusProductById
)

//Elimina un producto por su ID (eliminación lógica - mostrar)
router.delete('/:id',
    authenticate,
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    ProductController.deleteProductById
)

export default router
