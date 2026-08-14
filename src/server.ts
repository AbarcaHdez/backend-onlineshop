import express from 'express'
import dotenv from 'dotenv'
import morgan from 'morgan'
import path from 'path'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { connectDB } from './config/db'
import { corsOptions } from './config/cors'
import productRoutes from './routes/productRoutes'
import categoryRoutes from './routes/categoryRoutes'
import brandRoutes from './routes/brandRoutes'
import swaggerSpec from './config/swagger'
import storeRoutes from './routes/storeRoutes'
import authRoutes from './routes/authRoutes'
import orderRoutes from './routes/orderRoutes'
import uploadRoutes from './routes/uploadRoutes'

dotenv.config()

connectDB()

const app = express()

// Para que req.protocol refleje https cuando Nginx (u otro proxy) este
// delante de Node en produccion, leyendo el header X-Forwarded-Proto
app.set('trust proxy', 1)

app.use(cors(corsOptions))

app.use(express.json())

app.use(morgan('dev'))
//Routes
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))
app.use('/api/auth', authRoutes)
app.use('/api/store', storeRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/brands', brandRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

export default app