import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createBlog, deleteBlog, getAllBlogs, getBlogById, updateBlog, updateFeaturedImage } from "../controllers/blog.controller.js";

const router = Router()

router.route("/")
    .get(getAllBlogs)
    .post(upload.single("featuredImage"), createBlog)

router.route("/:blogId")
    .get(getBlogById)
    .patch(verifyJWT, updateBlog)
    .delete(verifyJWT, deleteBlog)

router.route("/:blogId")
    .patch(verifyJWT, upload.single("featuredImage"), updateFeaturedImage)

export default router