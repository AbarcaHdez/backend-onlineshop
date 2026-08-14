import mongoose, { Schema, Document } from 'mongoose'

export type CategoryType = Document & {
    name: string;
    slug: string;
    description: string;

    isActive: boolean;
    show: boolean;

    createdAt: Date;
    updatedAt: Date;
};

const CategorySchema: Schema = new Schema(
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

    isActive: {
        type: Boolean,
        default: true
    },

    show: {
        type: Boolean,
        default: true
    }

},
{
    timestamps: true
});

const Category = mongoose.model<CategoryType>('Category', CategorySchema)

export default Category
