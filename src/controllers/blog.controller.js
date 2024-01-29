import { asyncHandler } from "../utils/asyncHandler.js";
import { APIError } from "../utils/APIError.js";
import mongoose from "mongoose"
import { APIResponse } from "../utils/APIResponse.js";
import fs from "fs"
import { cloudinaryFileUpload } from "../utils/cloudinaryFileUpload.js";
import { Blog } from "../models/blog.model.js";
import { isValidObjectId } from "mongoose";

const createBlog = asyncHandler(async (req, res) => {

    const { title, content } = req.body;
    const featuredImageLocalFilePath = req.file?.path

    if (!featuredImageLocalFilePath) {
        throw new APIError(400, "Featured Image missing!")
    }

    // console.log(featuredImageLocalFilePath);

    if (!title || !content) {
        fs.unlinkSync(featuredImageLocalFilePath)
        throw new APIError(400, "All fields required!")
    }

    let cloudinaryFileDetails

    try {
        cloudinaryFileDetails = await cloudinaryFileUpload(featuredImageLocalFilePath)
    } catch (error) {
        fs.unlinkSync(featuredImageLocalFilePath)
        throw new APIError(500, error)
    }

    const featuredImage = cloudinaryFileDetails.url;

    let createdBlog

    try {
        createdBlog = await Blog.create({
            title,
            status: true,
            featuredImage,
            createdBy: req.user,
            content
        })
    } catch (error) {
        fs.unlinkSync(featuredImageLocalFilePath)
        throw new APIError(500, error.message)
    }

    return res.status(200)
        .json(new APIResponse(200, createdBlog, "Blog posted successfully!"))

})

const getBlogById = asyncHandler(async (req, res) => {

    const { blogId } = req.params

    if (!isValidObjectId(blogId)) {
        throw new APIError(400, "Invalid Blog ID!")
    }

    let blog

    try {
        blog = await Blog.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(blogId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdBy",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                email: 1,
                                fullName: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    createdBy: {
                        $first: "$createdBy"
                    }
                }
            }
        ])
    } catch (error) {
        throw new APIError(500, error.message)
    }

    if (!blog) {
        throw new APIError(404, "Blog does not exist!")
    }

    return res.status(200)
        .json(new APIResponse(200, blog, "Blog fetched successfully!"))
})

const getAllBlogs = asyncHandler(async (req, res) => {

    let blogs

    try {
        blogs = await Blog.aggregate([
            {
                $match: {
                    status: true
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "createdBy",
                    foreignField: "_id",
                    as: "createdBy",
                    pipeline: [
                        {
                            $project: {
                                username: 1,
                                email: 1,
                                fullName: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    createdBy: {
                        $first: "$createdBy"
                    }
                }
            }
        ])
    } catch (error) {
        throw new APIError(500, error.message)
    }

    return res.status(200)
        .json(new APIResponse(200, blogs, "Blogs fetched successfully!"))

})

const updateBlog = asyncHandler(async (req, res) => {

    const { blogId } = req.params
    const { title, content } = req.body

    if (!isValidObjectId(blogId)) {
        throw new APIError(400, "Invalid Blog ID!")
    }

    if (!title) {
        throw new APIError(400, "No title provided!")
    }

    if (!content) {
        throw new APIError(400, "No content provided!")
    }

    let updatedBlog

    try {
        updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            {
                title,
                content
            },
            {
                new: true
            }
        )
    } catch (error) {
        throw new APIError(500, error.message)
    }

    return res.status(200)
        .json(new APIResponse(200, updatedBlog, "Blog updated successfully!"))

})

const deleteBlog = asyncHandler(async (req, res) => {

    const { blogId } = req.params

    if (!isValidObjectId) {
        throw new APIError(400, "Invalid Blog ID!")
    }

    try {
        await Blog.findByIdAndDelete(blogId)
    } catch (error) {
        throw new APIError(500, error.message)
    }

    return res.status(200)
        .json(new APIResponse(200, {}, "Blog deleted successfully!"))

})

const updateFeaturedImage = asyncHandler(async (req, res) => {

    const { blogId } = req.params
    const featuredImageLocalPatch = req.file?.path

    if (!isValidObjectId(blogId)) {
        fs.unlinkSync(featuredImage)
        throw new APIError(400, "Invalid Blog ID!")
    }

    let featuredImage

    try {
        featuredImage = await cloudinaryFileUpload(featuredImageLocalPatch)
    } catch (error) {
        throw new APIError(500, error.message)
    }

    let updatedBlog

    try {
        updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            {
                featuredImage: featuredImage.url
            },
            {
                new: true
            }
        )
    } catch (error) {
        throw new APIError(500, error.message)
    }

    return res.status(200)
        .json(new APIResponse(200, updatedBlog, "Featured image updated successfully!"))

})

export {
    createBlog,
    getBlogById,
    getAllBlogs,
    updateBlog,
    deleteBlog,
    updateFeaturedImage
}