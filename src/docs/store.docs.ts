/**
 * @swagger
 * /api/store:
 *   get:
 *     summary: Obtener la configuracion de la tienda (se crea automaticamente con valores por defecto si todavia no existe)
 *     tags:
 *       - Tienda
 *     responses:
 *       200:
 *         description: Configuracion de la tienda
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 */

/**
 * @swagger
 * /api/store:
 *   put:
 *     summary: Actualizar la configuracion de la tienda (actualizacion parcial; la crea si todavia no existe)
 *     tags:
 *       - Tienda
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       description: Al menos un campo de la tienda a actualizar
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Perfumeria Dior
 *               whatsappNumber:
 *                 type: string
 *                 example: +521234567890
 *               currency:
 *                 type: string
 *                 example: MXN
 *               logoUrl:
 *                 type: string
 *                 example: https://ejemplo.com/logo.png
 *               primaryColor:
 *                 type: string
 *                 example: '#1a1a2e'
 *               secondaryColor:
 *                 type: string
 *                 example: '#e94560'
 *     responses:
 *       200:
 *         description: Tienda actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Store'
 *       400:
 *         description: Error de validacion o body vacio
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 */

export {}
