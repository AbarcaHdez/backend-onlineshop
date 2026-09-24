import { Router } from "express"
import { body } from 'express-validator'
import { StoreController } from "../controllers/StoreController"
import { handleInputErrors, isValidUrl } from "../middleware/validation"
import { authenticate } from "../middleware/auth"

const router = Router()

router.get('/', StoreController.getStore)

router.put('/',
    authenticate,
    body().custom((value, { req }) => {
        if (Object.keys(req.body).length === 0) {
            throw new Error('Debes enviar al menos un campo para actualizar')
        }
        return true
    }),
    body('name').optional({ checkFalsy: true }).isString(),
    body('whatsappNumber').optional({ checkFalsy: true }).isString(),
    body('currency').optional({ checkFalsy: true }).isLength({ min: 3, max: 3 }).withMessage('currency debe tener 3 letras'),
    body('logoUrl').optional({ checkFalsy: true }).custom((value) => {
        if (!isValidUrl(value)) {
            throw new Error('logoUrl debe ser una url valida')
        }
        return true
    }),
    body('primaryColor').optional({ checkFalsy: true }).isHexColor().withMessage('primaryColor debe ser un color hex valido'),
    body('secondaryColor').optional({ checkFalsy: true }).isHexColor().withMessage('secondaryColor debe ser un color hex valido'),
    body('latitude').optional({ checkFalsy: true }).isFloat({ min: -90, max: 90 }).withMessage('latitude debe ser un numero entre -90 y 90'),
    body('longitude').optional({ checkFalsy: true }).isFloat({ min: -180, max: 180 }).withMessage('longitude debe ser un numero entre -180 y 180'),
    body('facebookUrl').optional({ checkFalsy: true }).custom((value) => {
        if (!isValidUrl(value)) {
            throw new Error('facebookUrl debe ser una url valida')
        }
        return true
    }),
    body('instagramUrl').optional({ checkFalsy: true }).custom((value) => {
        if (!isValidUrl(value)) {
            throw new Error('instagramUrl debe ser una url valida')
        }
        return true
    }),
    handleInputErrors,
    StoreController.updateStore
)

export default router