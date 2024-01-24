import mongoose, { Schema } from 'mongoose';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
        maxLength: [16, "Please choose a username under 16 characters"],
        minLength: [3, "Please choose a username over 3 characters"]
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g, "Please enter a valid Email ID"],
        unique: true,
        required: true
    },
    fullName: {
        type: String,
        trim: true,
        required: true,
        index: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        match: [/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm, "Please enter a strong password"] // matches for special characters, numbers, small and uppercase letters
    },
    refreshToken: String,
}, { timestamps: true })

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
    }
    next()
})

userSchema.method({
    isPasswordCorrect: async function (password) {
        return await bcrypt.compare(password, this.password)
    },
    generateAcccessToken: function () {
        return jwt.sign(
            {
                id: this._id,
                username: this.username,
                email: this.email,
                fullName: this.fullName,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
            }
        )
    },
    generateRefreshToken: function () {
        return jwt.sign(
            {
                id: this._id
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
            }
        )
    }
})

// userSchema.method("isPasswordCorrect", async function (password) {
//     return await bcrypt.compare(password, this.password)
// })

// userSchema.method("generateAcccessToken", function () {
//     return jwt.sign(
//         {
//             id: this._id,
//             username: this.username,
//             email: this.email,
//             fullName: this.fullName,
//         },
//         process.env.ACCESS_TOKEN_SECRET,
//         {
//             expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
//         }
//     )
// })

// userSchema.method("generateRefreshToken", function () {
//     return jwt.sign(
//         {
//             id: this._id
//         },
//         process.env.REFRESH_TOKEN_SECRET,
//         {
//             expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
//         }
//     )
// })

export const User = mongoose.model("User", userSchema)