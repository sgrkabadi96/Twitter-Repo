import express from "express";
import {
  createPost,
  deletePost,
  likeUnlikePost,
  commentPost,
  getAllPosts,
  getLikedPost,
  getFollowingPost,
  getUserPost,
} from "../controllers/postController.js";
import { protectRoute } from "../utils/middleware.js";
const postRouter = express.Router();

postRouter.get("/all", protectRoute, getAllPosts);
postRouter.get("/likes/:id", protectRoute, getLikedPost);
postRouter.post("/create", protectRoute, createPost);
postRouter.delete("/delete/:id", protectRoute, deletePost);
postRouter.post("/like/:id", protectRoute, likeUnlikePost);
postRouter.post("/comment/:id", protectRoute, commentPost);
postRouter.get("/following", protectRoute, getFollowingPost);
postRouter.get("/user/:id", protectRoute, getUserPost);

export default postRouter;
