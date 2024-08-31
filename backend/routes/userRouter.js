import express from "express";

import { protectRoute } from "../utils/middleware.js";
import {
  followUnfollowUser,
  getUserProfile,
  getSuggestedUsers,
  updateUser
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/profile/:username", protectRoute, getUserProfile);
userRouter.get("/suggested", protectRoute, getSuggestedUsers);
userRouter.post("/follow/:id", protectRoute, followUnfollowUser);
userRouter.post("/update", protectRoute, updateUser);

export default userRouter;
