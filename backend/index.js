
import express from "express";
import productRouter from "./router/productRouter.js";
import mongoose from "mongoose";
import cors from "cors";
import imageRoute from "./router/imageRoute.js";
import Authrouter from "./router/AuthRouter.js";
import dotenv from "dotenv";
import orderRoute from "./router/OrderRoute.js";

dotenv.config();

let app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", Authrouter);
app.use("/api/products", productRouter);
app.use("/api/image", imageRoute);
app.use("/api/orders", orderRoute);

// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB Atlas");
    })
    .catch((error) => {
        console.log("MongoDB connection error:", error);
    });

app.listen(3000, () => {
    console.log("Server has been started");
});

