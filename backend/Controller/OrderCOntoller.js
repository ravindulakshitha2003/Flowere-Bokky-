import Order from "../models/Order.js";
import mongoose from "mongoose";

export async function createorder(req, res) {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: "Order details are not provided" });
  }

  try {
    // 1. Generate a unique orderId server-side
    const timestamp = Date.now();
    const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
    const generatedOrderId = `ORD-${timestamp}-${randomHex}`;

    // 2. Extract user ID (prioritize authenticated req.user from auth middleware)
    const rawUserId = req.user?.id || req.user?._id || req.body.customer?.userId;

    if (!rawUserId || !mongoose.Types.ObjectId.isValid(rawUserId)) {
      return res.status(400).json({ message: "Valid user ID is required to place an order" });
    }

    // 3. Construct full payload matching your Mongoose Schema
    const orderData = {
      ...req.body,
      orderId: generatedOrderId,
      user: new mongoose.Types.ObjectId(rawUserId),
    };

    const newOrder = new Order(orderData);
    const savedOrder = await newOrder.save();

    return res.status(201).json({
      message: "Order added successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
}




export async function getorders(req, res) {
  try {
    // Read userId from URL query parameter (?userId=...) or fall back to authenticated user token
    const userId = req.query.userId || req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(400).json({ message: "userId query parameter is required" });
    }

    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders: orders,
    });
  } catch (error) {
    console.error("Fetch orders error:", error.message);
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
}