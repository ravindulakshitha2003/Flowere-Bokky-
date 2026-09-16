import express from "express";
import { createorder,  getorders } from "../Controller/OrderCOntoller.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

// Adjust import path to match your auth middleware file

const orderRoute = express.Router();

// Protect the route using authentication middleware
orderRoute.post("/",  authenticateToken , createorder);
orderRoute.get("/",  authenticateToken , getorders);

export default orderRoute;