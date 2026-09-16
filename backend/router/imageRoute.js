import express from "express";

import { addgalleryimage ,getimages } from "../Controller/galleryContoller.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRole } from "../middleware/roleMiddleware.js";

const imageRoute = express.Router();
imageRoute.post("/", addgalleryimage);
imageRoute.get("/", getimages);

export  default imageRoute ;