import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors"

const app = express()

app.use(express.json({ limit: '32kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(express.static(`public`))
app.use(cookieParser())
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//Import Routers
import userRouter from "./routes/user.route.js"
import blogRouter from "./routes/blog.route.js"

app.use("/api/v1/user", userRouter)
app.use("/api/v1/blog", blogRouter)

export { app }