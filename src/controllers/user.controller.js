import { asyncHandler } from "../utils/asyncHandler.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { User } from "../models/user.model.js"
import { isValidObjectId } from "mongoose"

const cookieOptions = {
    httpOnly: true,
    secure: true
}

const generateRefreshAccessToken = async (userId) => {

    try {
        const user = await User.findById(userId)

        const accessToken = user.generateAcccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })
        return { refreshToken, accessToken }

    } catch (error) {
        throw new APIError(500, error.message)
    }

}

const registerUser = asyncHandler(async (req, res) => {

    const { email, username, fullName, password } = req.body

    if ([email, username, fullName, password].some((field) => field.trim() === "")) {
        throw new APIError(400, "All fields are required!")
    }

    const userWithEmailExists = await User.findOne({
        email
    })

    const usernameExists = await User.findOne({
        username
    })

    if (userWithEmailExists) {
        throw new APIError(400, "Account with email already exists!")
    }

    if (usernameExists) {
        throw new APIError(400, "Username already taken!")
    }

    try {
        await User.create({
            username,
            email,
            fullName,
            password
        })
    } catch (error) {
        throw new APIError(500, error.message)
    }

    const createdUser = User.findOne({ email }).select("-password -refreshToken")

    return res.status(200)
        .json(new APIResponse(201, createdUser, "User registered successfully!"))
})

const loginUser = asyncHandler(async (req, res) => {

    const { email, username, password } = req.body

    console.log(req.body);

    if (!(email || username)) {
        throw new APIError(400, "Email or password required!")
    }

    if (!password) {
        throw new APIError(400, "Password not provided!")
    }

    const user = await User.findOne(
        {
            $or: [{ email }, { username }]
        }
    )

    if (!user) {
        throw new APIError(404, "User does not exist!")
    }

    const validPassword = await user.isPasswordCorrect(password)

    if (!validPassword) {
        throw new APIError(400, "Invalid Password!")
    }

    const { refreshToken, accessToken } = await generateRefreshAccessToken(user._id)

    const loggedUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new APIResponse(200, loggedUser, "User logged in successfully!"))

})

const logoutUser = asyncHandler(async (req, res) => {

    const { userId } = req.user._id

    if (!isValidObjectId(userId)) {
        throw new APIError(400, "Invalid User ID!")
    }

    try {
        await User.findByIdAndUpdate(
            userId,
            {
                $unset: {
                    refreshToken: 1
                }
            },
        )
    } catch (error) {
        throw new APIError(500, error.message)
    }

    res.status(200)
        .clearCookie("accessToken", cookieOptions)
        .clearCookie("refreshToken", cookieOptions)
        .json(new APIResponse(200, {}, "User logged out successfully!"))

})

const getCurrentUser = (req, res) => {
    return res.status(200)
        .json(new APIResponse(200, req.user, "User fetched successfully!"))
}

const updatePassword = asyncHandler(async (req, res) => {

    const { userId } = req.user._id
    const { oldPassword, newPassword } = req.body

    if (!oldPassword) {
        throw new APIError(400, "Old password is required!")
    }

    if (!password) {
        throw new APIError(400, "Password is required!")
    }

    const user = await User.findById(userId)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new APIError(400, "Invalid Password!")
    }

    try {
        user.password = newPassword
        await user.save({ validateBeforeSave: false })
    } catch (error) {
        throw new APIError(500, error.message)
    }

    return res.status(200)
        .json("Password updated successfully!")

})

const updateUserDetails = asyncHandler(async (req, res) => {

    const { email, fullName } = req.body
    const { userId } = req.user._id

    if (!email) {
        throw new APIError(400, "Email required!")
    }

    if (!fullName) {
        throw new APIError(400, "Full Name required!")
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
            email,
            fullName
        },
        {
            new: true
        }
    ).select("-password -refreshToken")

    return res.status(200)
        .json(new APIResponse(200, updatedUser, "User details updated successfully!"))

})

export {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    updatePassword,
    updateUserDetails
}