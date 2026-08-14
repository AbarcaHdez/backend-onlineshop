import { Router } from 'express'
import { body, param, query } from 'express-validator'
import { OrderController } from '../controllers/OrderController'
import { handleInputErrors } from '../middleware/validation'
import { authenticate } from '../middleware/auth'

const router = Router()

// Confirma un pedido (publico, sin autenticacion - lo hace el cliente final desde el carrito)
router.post('/',
    body('customerName')
        .notEmpty().withMessage('El nombre del cliente es obligatorio')
        .isString().withMessage('El nombre debe ser texto')
        .trim(),

    body('items')
        .isArray({ min: 1 }).withMessage('El pedido debe tener al menos un producto'),
    body('items.*.productId')
        .isMongoId().withMessage('Cada productId debe ser un id valido'),
    body('items.*.quantity')
        .isInt({ min: 1 }).withMessage('La cantidad de cada producto debe ser un numero entero mayor a 0'),

    handleInputErrors,
    OrderController.createOrder
)

// Lista los pedidos (panel de administracion)
router.get('/',
    authenticate,
    query('status')
        .optional()
        .isIn(['pending', 'completed', 'cancelled']).withMessage('status debe ser pending, completed o cancelled'),
    handleInputErrors,
    OrderController.getAllOrders
)

// Obtiene un pedido por su ID
router.get('/:id',
    authenticate,
    param('id').isMongoId().withMessage('ID no valido'),
    handleInputErrors,
    OrderController.getOrderById
)

// Actualiza el estado de un pedido
router.patch('/:id',
    authenticate,
    param('id').isMongoId().withMessage('ID no valido'),
    body('status')
        .notEmpty().withMessage('status es obligatorio')
        .isIn(['pending', 'completed', 'cancelled']).withMessage('status debe ser pending, completed o cancelled'),
    handleInputErrors,
    OrderController.updateOrderStatus
)

export default router
