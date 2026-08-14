/**
 * @swagger
 * /api/brands:
 *   post:
 *     summary: Crear una nueva marca
 *     tags:
 *       - Marcas
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
 *                 example: Dior
 *               slug:
 *                 type: string
 *                 example: dior
 *               description:
 *                 type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Marca creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Error de validacion o dato duplicado (slug ya existe)
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 */

/**
 * @swagger
 * /api/brands:
 *   get:
 *     summary: Obtener todas las marcas visibles
 *     tags:
 *       - Marcas
 *     responses:
 *       200:
 *         description: Lista de marcas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Brand'
 */

/**
 * @swagger
 * /api/brands/{id}:
 *   get:
 *     summary: Obtener una marca por su ID
 *     tags:
 *       - Marcas
 *     parameters:
 *       - $ref: '#/components/parameters/brandId'
 *     responses:
 *       200:
 *         description: Marca encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       400:
 *         description: ID no valido
 *       404:
 *         description: Marca no encontrada
 */

/**
 * @swagger
 * /api/brands/{id}:
 *   put:
 *     summary: Actualizar una marca (actualizacion parcial)
 *     tags:
 *       - Marcas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/brandId'
 *     requestBody:
 *       required: true
 *       description: Al menos un campo de la marca a actualizar
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
 *         description: Marca actualizada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       400:
 *         description: Error de validacion, body vacio o dato duplicado
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 *       404:
 *         description: Marca no encontrada
 */

/**
 * @swagger
 * /api/brands/{id}:
 *   patch:
 *     summary: Alternar isActive (mostrar/ocultar la marca del catalogo)
 *     tags:
 *       - Marcas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/brandId'
 *     responses:
 *       200:
 *         description: Estado isActive invertido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 *       404:
 *         description: Marca no encontrada
 */

/**
 * @swagger
 * /api/brands/{id}:
 *   delete:
 *     summary: Eliminar una marca (eliminacion logica, marca show en false)
 *     tags:
 *       - Marcas
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/brandId'
 *     responses:
 *       200:
 *         description: Marca eliminada correctamente
 *       401:
 *         description: No autorizado (falta o es invalido el token)
 *       404:
 *         description: Marca no encontrada o ya eliminada
 */

export {}
