# ShopHub API & Web

## Descripción

ShopHub es una plataforma de comercio electrónico desarrollada con el stack MERN, diseñada para ser reutilizable por cualquier negocio que desee mostrar y ofrecer sus productos de forma sencilla.

A diferencia de un e-commerce tradicional, ShopHub no procesa pagos en línea. El objetivo es simplificar el proceso de compra permitiendo que los clientes agreguen productos a un carrito y envíen su pedido directamente por WhatsApp al propietario del negocio.

De esta forma, los comerciantes pueden vender sus productos sin preocuparse por integrar pasarelas de pago, manejar información bancaria o almacenar datos sensibles de sus clientes.

---

# Objetivo

Crear una plataforma moderna, escalable y reutilizable que pueda adaptarse a distintos tipos de negocios, por ejemplo:

- Tiendas de ropa
- Perfumerías
- Zapaterías
- Accesorios
- Electrónica
- Papelerías
- Tiendas deportivas
- Joyerías
- Ferreterías
- Negocios locales
- Catálogos de productos
- Emprendedores

La arquitectura está diseñada para que un mismo sistema pueda utilizarse en diferentes comercios únicamente cambiando la información de la tienda.

---

# Flujo de compra

1. El usuario navega por el catálogo.
2. Consulta los detalles de los productos.
3. Agrega productos al carrito.
4. Modifica cantidades.
5. Confirma el pedido.
6. El sistema genera automáticamente un mensaje con el resumen de la compra.
7. Se abre WhatsApp con el mensaje listo para enviarse al vendedor.
8. El vendedor continúa la negociación directamente con el cliente.

Ejemplo:

Hola, me interesa realizar el siguiente pedido:

• 2 × Perfume Dior Sauvage
• 1 × Playera Oversize Negra
• 3 × Gorra Nike

Total aproximado: $4,350 MXN

Mi nombre es Juan.

Gracias.

---

# ¿Por qué este enfoque?

Muchos pequeños negocios necesitan presencia en internet, pero no requieren una tienda con pagos en línea.

Los principales problemas suelen ser:

- Integración de pasarelas de pago.
- Costos de mantenimiento.
- Certificados de seguridad.
- Manejo de información bancaria.
- Procesos fiscales.
- Protección de datos sensibles.

Este proyecto elimina toda esa complejidad.

El comercio se realiza mediante WhatsApp, donde vendedor y comprador acuerdan el método de pago y la entrega.

---

# Tecnologías

## Frontend

- React
- TypeScript
- React Router
- React Query (TanStack Query)
- Axios
- Tailwind CSS

## Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Mongoose

## Arquitectura

- MERN Stack
- REST API
- MVC (Model - View - Controller)
- Repository Pattern (cuando aplique)
- Servicios desacoplados
- Validaciones
- Manejo centralizado de errores

---

# Características

- Catálogo de productos
- Categorías
- Marcas
- Variantes de productos
- Búsqueda
- Filtros
- Carrito de compras
- Generación automática del pedido
- Envío del pedido mediante WhatsApp
- Panel de administración
- Gestión de inventario
- Carga de imágenes
- API reutilizable
- Diseño responsive

---

# Modelo de negocio

El proyecto busca ser una solución que pueda instalarse para distintos clientes.

Cada negocio podrá tener:

- Su propio catálogo
- Su propio logotipo
- Sus colores
- Su número de WhatsApp
- Sus categorías
- Sus productos

Sin modificar el código principal.

---

# Principios del proyecto

- Código limpio
- Escalabilidad
- Reutilización
- Separación de responsabilidades
- Arquitectura desacoplada
- Buenas prácticas
- API First
- Fácil mantenimiento

---

# Estructura general

Frontend (React)

↓

REST API

↓

Controladores

↓

Servicios

↓

Modelos

↓

MongoDB

---

# Estado del proyecto

En desarrollo.

El objetivo es construir una plataforma completamente reutilizable que pueda servir como base para cualquier tienda en línea enfocada en catálogos y ventas mediante WhatsApp.