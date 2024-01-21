import mongoose from "mongoose"
import { DB_NAME } from "../constants.js";

const connectDB = async () => {

    try {
        const dbInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`MongoDB connected!! DB Host: ${dbInstance.connections[0].host}`);
    } catch (error) {
        console.log("MongoDB Connection Error: ", error.message);
    }

}

export default connectDB