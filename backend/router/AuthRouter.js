import express from "express";
import { registerUser} from "../Controller/UserController.js";

import { loginUser } from "../Controller/authController.js";

const Authrouter = express.Router();
Authrouter.post("/register",registerUser);
Authrouter.post("/Login",loginUser);

export default Authrouter;