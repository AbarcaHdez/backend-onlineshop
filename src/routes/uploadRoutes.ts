import { Router } from 'express'
import { UploadController } from '../controllers/UploadController'
import { authenticate } from '../middleware/auth'
import { uploadSingleImage } from '../middleware/upload'

const router = Router()

// Sube una imagen (campo "image", multipart/form-data) y devuelve su url.
// La url resultante se usa despues en Product.images o Store.logoUrl.
router.post('/',
    authenticate,
    uploadSingleImage,
    UploadController.uploadImage
)

export default router
