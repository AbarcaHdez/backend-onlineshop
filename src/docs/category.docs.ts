/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Crear una nueva categoria
 *     tags:
 *       - Categorias
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: Ropa
 *               slug:
 *                 type: string
 *                 example: ropa
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Categoria creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Error de validacion o dato duplicado (slug ya existe)
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 */

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Obtener todas las categorias visibles
 *     tags:
 *       - Categorias
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Category'
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Obtener una categoria por su ID
 *     tags:
 *       - Categorias
 *     parameters:
 *       - $ref: '#/components/parameters/categoryId'
 *     responses:
 *       200:
 *         description: Categoria encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: ID no valido
 *       404:
 *         description: Categoria no encontrada
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Actualizar una categoria (actualizacion parcial)
 *     tags:
 *       - Categorias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/categoryId'
 *     requestBody:
 *       required: true
 *       description: Al menos un campo de la categoria a actualizar
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Categoria actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       400:
 *         description: Error de validacion, body vacio o dato duplicado
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 *       404:
 *         description: Categoria no encontrada
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   patch:
 *     summary: Alternar isActive (mostrar/ocultar la categoria del catalogo)
 *     tags:
 *       - Categorias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/categoryId'
 *     responses:
 *       200:
 *         description: Estado isActive invertido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Category'
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 *       404:
 *         description: Categoria no encontrada
 */

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Eliminar una categoria (eliminacion logica, marca show en false)
 *     tags:
 *       - Categorias
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/categoryId'
 *     responses:
 *       200:
 *         description: Categoria eliminada correctamente
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 *       404:
 *         description: Categoria no encontrada o ya eliminada
 */

export {}
