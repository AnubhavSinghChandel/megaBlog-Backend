import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createBlog, deleteBlog, getAllBlogs, getBlogById, getUserBlogs, updateBlog, updateFeaturedImage } from "../controllers/blog.controller.js";

const router = Router()

router.route("/")
    .get(getAllBlogs)
    .post(verifyJWT, upload.single("featuredImage"), createBlog)

router.route("/:blogId")
    .get(getBlogById)
    .patch(verifyJWT, updateBlog)
    .delete(verifyJWT, deleteBlog)

router.route("/featuedImage/:blogId")
    .post(verifyJWT, upload.single("featuredImage"), updateFeaturedImage)

router.route("/current-user/blogs")
    .get(verifyJWT, getUserBlogs)

export default router