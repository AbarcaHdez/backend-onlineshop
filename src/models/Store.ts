import mongoose, { Schema, Document } from "mongoose"

export type StoreType = Document & {
    name: string;
    whatsappNumber: string;
    currency: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
    latitude?: number;
    longitude?: number;
    facebookUrl?: string;
    instagramUrl?: string;
    aboutText: string;
    aboutImageUrl: string;

    createdAt: Date;
    updatedAt: Date;
}

const StoreSchema: Schema = new Schema({
    name: {
        type: String,
        default: "",
        trim: true
    },

    whatsappNumber: {
        type: String,
        default: "",
        trim: true
    },

    currency: {
        type: String,
        default: "MXN",
        trim: true,
        uppercase: true 
    },

    logoUrl: {
        type: String,
        default: ""
    },

    primaryColor: {
        type: String,
        default: ""
    },

    secondaryColor: {
        type: String,
        default: ""
    },

    latitude: {
        type: Number
    },

    longitude: {
        type: Number
    },

    facebookUrl: {
        type: String,
        default: ""
    },

    instagramUrl: {
        type: String,
        default: ""
    },

    aboutText: {
        type: String,
        default: "Somos una tienda dedicada a ofrecerte productos de calidad con una atención cercana y personalizada. Nuestro objetivo es que encuentres justo lo que buscas, de forma simple y confiable.",
        trim: true
    },

    aboutImageUrl: {
        type: String,
        default: ""
    }
},
{
    timestamps: true
});

const Store = mongoose.model<StoreType>('Store',StoreSchema)

export default Store