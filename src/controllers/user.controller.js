import { asyncHandler } from "../utils/asyncHandler.js"
import { APIError } from "../utils/APIError.js"
import { APIResponse } from "../utils/APIResponse.js"
import { User } from "../models/user.model.js"

const cookieOptions = {
    httpOnly: true,
    secure: true
}

const generateRefreshAccessToken = async (userId) => {

    try {
        const user = User.find(userId)

        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

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

    if (!(email && username)) {
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

export {
    registerUser,
    loginUser
}