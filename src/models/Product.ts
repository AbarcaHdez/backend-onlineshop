import mongoose, {Schema, Document, Types} from 'mongoose'

export type ProductType = Document & {
    name: string;
    slug: string;
    description: string;

    price: number;
    discountPrice?: number;

    sku: string;

    brandId: Types.ObjectId | null;
    categoryIds: Types.ObjectId[];

    images: {
        url: string;
        alt?: string;
        order?: number;
    }[];

    attributes: Record<string, any>;

    variants: {
        sku: string;
        price: number;
        attributes: Record<string, any>;
    }[];

    isActive: boolean;
    show: boolean;

    tags: string[];

    createdAt: Date;
    updatedAt: Date;
};

const ProductSchema: Schema = new Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    description: {
        type: String,
        default: ""
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },

    discountPrice: {
        type: Number,
        min: 0,
        validate: {
            validator: function (this: any, value: number) {
                // en updates, 'this' es la query y no tiene 'price';
                // esa comparacion ya la valida la ruta (express-validator)
                if (value == null || this.price === undefined) return true;
                return value < this.price;
            },
            message: "discountPrice debe ser menor que price"
        }
    },

    sku: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    brandId: {
        type: Types.ObjectId,
        ref: "Brand",
        default: null
    },

    categoryIds: [{
        type: Types.ObjectId,
        ref: "Category"
    }],

    images: [{
        url: {
            type: String,
            required: true
        },
        alt: {
            type: String,
            default: ""
        },
        order: {
            type: Number,
            default: 0
        }
    }],

    attributes: {
        type: Schema.Types.Mixed,
        default: {}
    },

    variants: [{
        sku: String,
        price: Number,
        attributes: {
            type: Schema.Types.Mixed,
            default: {}
        }
    }],

    isActive: {
        type: Boolean,
        default: true
    },

    show: {
        type: Boolean,
        default: true
    },

    tags: [{
        type: String,
        trim: true
    }]

},
{
    timestamps: true
});

// Busqueda de texto libre por nombre, descripcion y tags (Product.find({ $text: { $search: "..." } }))
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Catalogo publico: getAllProducts filtra siempre por show+isActive, y ademas por categoria o marca
ProductSchema.index({ show: 1, isActive: 1, categoryIds: 1 });
ProductSchema.index({ show: 1, isActive: 1, brandId: 1 });

const Product = mongoose.model<ProductType>('Product', ProductSchema);

export default Product; 