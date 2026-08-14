import { exit } from 'node:process'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import { connectDB } from '../config/db'
import Product from '../models/Product'
import Brand from '../models/Brand'
import Category from '../models/Category'

dotenv.config()

const clearDB = async () => {
    try {
        await connectDB()
        await Product.deleteMany({})
        await Brand.deleteMany({})
        await Category.deleteMany({})
        console.log('Datos eliminados correctamente')
        await mongoose.disconnect()
        exit(0)
    } catch (error) {
        console.log(error)
        exit(1)
    }
}

if(process.argv[2] === '--clear') {
    clearDB()
}