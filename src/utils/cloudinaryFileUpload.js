import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'
import { APIError } from './APIError.js';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryFileUpload = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        // Upload file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // console.log("File has been uploaded to cloudinary ", response.url);
        fs.unlinkSync(localFilePath)
        return response
    } catch (error) {
        // console.log(error);
        // fs.unlinkSync(localFilePath) // Remove the locally saved temp file as upload fails
        throw new APIError(500, error)
    }
}

export { cloudinaryFileUpload }