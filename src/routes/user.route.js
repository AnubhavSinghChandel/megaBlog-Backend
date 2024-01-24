import { Router } from "express";
import { getCurrentUser, loginUser, logoutUser, registerUser, updatePassword, updateUserDetails } from "../controllers/user.controller.js";

const router = Router()

router.route("/register")
    .post(registerUser)

router.route("/")
    .get(getCurrentUser)

router.route("/update/password")
    .patch(updatePassword)

router.route("/update/user")
    .patch(updateUserDetails)

router.route("/login")
    .post(loginUser)

router.route("/logout")
    .post(logoutUser)

export default router