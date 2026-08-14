import mongoose, { Schema, Document } from "mongoose"

export type StoreType = Document & {
    name: string;
    whatsappNumber: string;
    currency: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;

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
    }
},
{
    timestamps: true
});

const Store = mongoose.model<StoreType>('Store',StoreSchema)

export default Store