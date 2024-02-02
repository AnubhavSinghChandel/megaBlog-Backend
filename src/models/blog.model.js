import mongoose, { Schema } from 'mongoose';

const blogSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: Boolean,
        default: true
    },
    featuredImage: {
        type: String,
        required: true,
    },
    createdBy: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
}, { timestamps: true })

export const Blog = mongoose.model("Blog", blogSchema)