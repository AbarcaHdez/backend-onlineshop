import mongoose, { Schema, Document, Types } from 'mongoose'

export type OrderStatus = 'pending' | 'completed' | 'cancelled'

export type OrderType = Document & {
    items: {
        productId: Types.ObjectId;
        name: string;
        price: number;
        quantity: number;
    }[];

    customerName: string;
    total: number;
    status: OrderStatus;

    createdAt: Date;
    updatedAt: Date;
};

const OrderSchema: Schema = new Schema(
{
    items: [{
        productId: {
            type: Types.ObjectId,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    }],

    customerName: {
        type: String,
        required: true,
        trim: true
    },

    total: {
        type: Number,
        required: true,
        min: 0
    },

    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
},
{
    timestamps: true
});

// Panel de administracion: listado de pedidos filtrado por estado, mas recientes primero
OrderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model<OrderType>('Order', OrderSchema);

export default Order
