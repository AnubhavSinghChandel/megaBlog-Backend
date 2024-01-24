import jwt from "jsonwebtoken"
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { isValidObjectId } from "mongoose";

const verifyJWT = asyncHandler(async (req, _, next) => {

    const accessToken = req.cookies?.accessToken

    if (!accessToken) {
        throw new APIError(401, "Unauthorized request!")
    }

    let decodedToken

    try {
        decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    } catch (error) {
        throw new APIError(401, error.message)
    }

    const userId = decodedToken.id

    if (isValidObjectId(userId)) {
        throw new APIError(400, "Invalid User ID!")
    }

    const user = await User.findById(userId).select("-password -refreshToken")

    if (!user) {
        throw new APIError(404, "User not found!")
    }

    req.user = user
    next()

})

export { verifyJWT }