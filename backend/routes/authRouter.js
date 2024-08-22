import express from "express";
import { signup, login, logout, getMe } from "../controllers/authController.js";
import { protectRoute } from "../utils/middleware.js";
const authRouter = express.Router();

authRouter.get("/me", protectRoute, getMe);

authRouter.post("/signup", signup);

authRouter.post("/login", login);

authRouter.post("/logout", logout);

export default authRouter;
