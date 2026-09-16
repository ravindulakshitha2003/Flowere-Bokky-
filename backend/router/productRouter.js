import express from "express";
import { createProduct ,getproduct,getProductById } from "../Controller/ProductController.js";


const productRouter = express.Router();
productRouter.post("/", createProduct);
productRouter.get("/", getproduct);
productRouter.get("/:productId",getProductById);


export  default productRouter ;