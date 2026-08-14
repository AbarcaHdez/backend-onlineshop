import mongoose, { Schema, Document } from 'mongoose'

export type AdminType = Document & {
    email: string;
    name: string;
    password: string;

    createdAt: Date;
    updatedAt: Date;
}

const AdminSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },

    name: {
        type: String,
        trim: true
    },

    password: {
        type: String,
        required: true
    }
},
{
    timestamps: true
});

const Admin = mongoose.model<AdminType>('Admin',AdminSchema)

export default Admin