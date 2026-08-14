import mongoose, { Schema, Document } from 'mongoose'

export type BrandType = Document & {
    name: string;
    slug: string;
    description: string;

    isActive: boolean;
    show: boolean;

    createdAt: Date;
    updatedAt: Date;
};

const BrandSchema: Schema = new Schema(
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

const Brand = mongoose.model<BrandType>('Brand',BrandSchema)

export default Brand