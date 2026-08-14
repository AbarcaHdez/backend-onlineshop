import swaggerJSDoc from 'swagger-jsdoc'

const options: swaggerJSDoc.options = {
    swaggerDefinition: {
        openapi: '3.0.0',
        tags: [
            {
                name: 'Autenticacion',
                description: 'Login del admin de la tienda'
            },
            {
                name: 'Productos',
                description: 'Operaciones de la API relacionada a productos'
            },
            {
                name: 'Categorias',
                description: 'Operaciones de la API relacionada a categorias'
            },
            {
                name: 'Marcas',
                description: 'Operaciones de la API relacionada a marcas'
            },
            {
                name: 'Tienda',
                description: 'Configuracion general del negocio (nombre, WhatsApp, moneda, colores)'
            },
            {
                name: 'Pedidos',
                description: 'Carrito confirmado por el cliente y su envio por WhatsApp'
            },
            {
                name: 'Uploads',
                description: 'Subida de imagenes (guardadas en la carpeta local uploads/)'
            }
        ],
        info: {
            title: 'REST API Products',
            version: '1.0.0',
            description: 'API Docs de Productos'
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Token obtenido en POST /api/auth/login. Se manda como "Authorization: Bearer <token>".'
                }
            },
            parameters: {
                productId: {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'ID (ObjectId de MongoDB) del producto'
                },
                categoryId: {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'ID (ObjectId de MongoDB) de la categoria'
                },
                brandId: {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'ID (ObjectId de MongoDB) de la marca'
                },
                orderId: {
                    in: 'path',
                    name: 'id',
                    required: true,
                    schema: { type: 'string' },
                    description: 'ID (ObjectId de MongoDB) del pedido'
                }
            },
            schemas: {
                Product: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
                        name: { type: 'string', example: 'Cuaderno Profesional' },
                        slug: { type: 'string', example: 'cuaderno-profesional' },
                        description: { type: 'string', example: 'Cuaderno de 100 hojas' },
                        price: { type: 'number', example: 65 },
                        discountPrice: { type: 'number', example: 50 },
                        sku: { type: 'string', example: 'PAP-CUAD-001' },
                        brandId: { type: 'string', nullable: true },
                        categoryIds: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        images: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    url: { type: 'string' },
                                    alt: { type: 'string' },
                                    order: { type: 'number' }
                                }
                            }
                        },
                        attributes: { type: 'object' },
                        variants: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    sku: { type: 'string' },
                                    price: { type: 'number' },
                                    attributes: { type: 'object' }
                                }
                            }
                        },
                        isActive: { type: 'boolean', example: true },
                        show: { type: 'boolean', example: true },
                        tags: {
                            type: 'array',
                            items: { type: 'string' }
                        },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Category: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
                        name: { type: 'string', example: 'Ropa' },
                        slug: { type: 'string', example: 'ropa' },
                        description: { type: 'string', example: 'Prendas de vestir' },
                        isActive: { type: 'boolean', example: true },
                        show: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Brand: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
                        name: { type: 'string', example: 'Dior' },
                        slug: { type: 'string', example: 'dior' },
                        description: { type: 'string', example: 'Marca de perfume popular' },
                        isActive: { type: 'boolean', example: true },
                        show: { type: 'boolean', example: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Store: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
                        name: { type: 'string', example: 'Perfumeria Dior' },
                        whatsappNumber: { type: 'string', example: '+521234567890' },
                        currency: { type: 'string', example: 'MXN' },
                        logoUrl: { type: 'string', example: 'https://ejemplo.com/logo.png' },
                        primaryColor: { type: 'string', example: '#1a1a2e' },
                        secondaryColor: { type: 'string', example: '#e94560' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
                        items: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    productId: { type: 'string', example: '64f1a2b3c4d5e6f7a8b9c0d1' },
                                    name: { type: 'string', example: 'Perfume Dior Sauvage' },
                                    price: { type: 'number', example: 1000 },
                                    quantity: { type: 'number', example: 2 }
                                }
                            }
                        },
                        customerName: { type: 'string', example: 'Juan' },
                        total: { type: 'number', example: 2300 },
                        status: { type: 'string', enum: ['pending', 'completed', 'cancelled'], example: 'pending' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                }
            }
        }
    },
    apis: ['./src/docs/*.ts']
}

const swaggerSpec = swaggerJSDoc(options)
export default swaggerSpec
