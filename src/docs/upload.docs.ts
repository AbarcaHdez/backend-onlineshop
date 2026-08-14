/**
 * @swagger
 * /api/uploads:
 *   post:
 *     summary: Subir una imagen (se guarda en la carpeta local uploads/) y obtener su url, para usarla despues en Product.images o Store.logoUrl
 *     tags:
 *       - Uploads
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Imagen subida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: http://localhost:4000/uploads/1699999999999-a1b2c3d4e5f6a7b8.jpg
 *       400:
 *         description: No se envio ninguna imagen, el formato no esta permitido (solo jpg/png/webp/gif) o supera los 5MB
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 */

export {}
