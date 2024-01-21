import "dotenv/config"
import connectDB from "./db/connection.js"
import { app } from "./app.js"

const port = process.env.PORT

connectDB()
    .then(() => {
        app.listen(port || 8000, () => {
            console.log("Server up and running on port: ", port);
        })
    })
    .catch((error) => {
        console.log("MongoDB Connection Error: ", error.message);
    })