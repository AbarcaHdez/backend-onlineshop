/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Confirmar un pedido (lo hace el cliente final desde el carrito) - recalcula precios contra los productos reales y devuelve el link de WhatsApp
 *     tags:
 *       - Pedidos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerName
 *               - items
 *             properties:
 *               customerName:
 *                 type: string
 *                 example: Juan
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: 64f1a2b3c4d5e6f7a8b9c0d1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Pedido creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *                 whatsappUrl:
 *                   type: string
 *                   example: https://wa.me/521234567890?text=Hola%2C%20me%20interesa...
 *       400:
 *         description: Error de validacion o algun producto no existe/no esta disponible
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Listar los pedidos (panel de administracion)
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filtra los pedidos por estado
 *     responses:
 *       200:
 *         description: Lista de pedidos, mas recientes primero
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       400:
 *         description: status invalido
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Obtener un pedido por su ID
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/orderId'
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: ID no valido
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 *       404:
 *         description: Pedido no encontrado
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   patch:
 *     summary: Actualizar el estado de un pedido
 *     tags:
 *       - Pedidos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/orderId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled]
 *     responses:
 *       200:
 *         description: Estado del pedido actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Error de validacion (status faltante o invalido)
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 *       404:
 *         description: Pedido no encontrado
 */

export {}
