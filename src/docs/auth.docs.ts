/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesion como admin y obtener un token JWT
 *     tags:
 *       - Autenticacion
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@ejemplo.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: 'JWT valido por 7 dias. Se manda en el header Authorization como "Bearer token" para acceder a los endpoints protegidos.'
 *       400:
 *         description: Error de validacion (email invalido o password vacio)
 *       401:
 *         description: Credenciales invalidas (email no existe o password incorrecto)
 */

export {}
