import { Router } from 'express'
import { body, param } from 'express-validator'
import { CategoryController } from '../controllers/CategoryController'
import { handleInputErrors } from '../middleware/validation'
import { authenticate } from '../middleware/auth'

const router = Router()

//Crea una categoria
router.post('/',
    authenticate,
    body('name')
        .notEmpty().withMessage('El nombre de la categoria es obligatorio')
        .isString().withMessage('El nombre debe ser texto')
        .trim(),

    body('slug')
        .notEmpty().withMessage('El slug es obligatorio')
        .isSlug().withMessage('El slug solo puede contener letras minusculas, numeros y guiones')
        .trim(),

    body('description')
        .optional()
        .isString().withMessage('La descripcion debe ser texto'),

    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive debe ser true o false'),

    handleInputErrors,
    CategoryController.createCategory
)

//Obtiene todas las categorías
router.get('/', 
    CategoryController.getAllCategories
)

//Obtiene una categoría por su ID
router.get('/:id',
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    CategoryController.getCategoryById
)
 
//Actualiza una categoría por su ID
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
        .notEmpty().withMessage('El nombre de la categoria no puede estar vacio')
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

    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive debe ser true o false'),

    handleInputErrors,
    CategoryController.updateCategoryById
)

//Alterna el isActive por su ID (mostrar la categoría)
router.patch('/:id',
    authenticate,
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    CategoryController.updateStatusCategoryById
)

//Elimina una categoría por su ID (eliminación lógica - mostrar)
router.delete('/:id',
    authenticate,
    param('id').isMongoId().withMessage('ID no válido'),
    handleInputErrors,
    CategoryController.deleteCategoryById
)

export default router
