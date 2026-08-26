/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Cuaderno Profesional
 *               slug:
 *                 type: string
 *                 example: cuaderno-profesional
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 65
 *               discountPrice:
 *                 type: number
 *                 example: 50
 *               sku:
 *                 type: string
 *                 example: PAP-CUAD-001
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Error de validacion o dato duplicado (slug/sku ya existen)
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtener todos los productos visibles en el catalogo
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Busqueda de texto libre (name, description, tags)
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filtra por categoria
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: string
 *         description: Filtra por marca
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *         description: Si es true, incluye tambien productos con isActive en false (uso administrativo)
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtener un producto por su ID
 *     tags:
 *       - Productos
 *     parameters:
 *       - $ref: '#/components/parameters/productId'
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: ID no valido
 *       404:
 *         description: Producto no encontrado
 */

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualizar un producto (actualizacion parcial)
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/productId'
 *     requestBody:
 *       required: true
 *       description: Al menos un campo del producto a actualizar
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               discountPrice:
 *                 type: number
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Producto actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Error de validacion, body vacio o dato duplicado
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 *       404:
 *         description: Producto no encontrado
 */

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Alternar isActive (mostrar/ocultar el producto del catalogo)
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/productId'
 *     responses:
 *       200:
 *         description: Estado isActive invertido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 *       404:
 *         description: Producto no encontrado
 */

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Eliminar un producto (eliminacion logica, marca show en false)
 *     tags:
 *       - Productos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/productId'
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 *       404:
 *         description: Producto no encontrado o ya eliminado
 */

export {}
