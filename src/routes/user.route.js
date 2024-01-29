import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getCurrentUser, loginUser, logoutUser, registerUser, updatePassword, updateUserDetails } from "../controllers/user.controller.js";

const router = Router()

router.route("/register")
    .post(registerUser)

router.route("/")
    .get(verifyJWT, getCurrentUser)

router.route("/update/password")
    .patch(verifyJWT, updatePassword)

router.route("/update/user")
    .patch(verifyJWT, updateUserDetails)

router.route("/login")
    .post(loginUser)

router.route("/logout")
    .post(verifyJWT, logoutUser)

export default router