import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import Post from "../models/postModel.js";
import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import Notification from "../models/notificationModel.js";

export async function createPost(req, res) {
  try {
    const userId = req.user._id;
    const { text } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .json(404)
        .json({ message: "Please authenticate before creating a post" });
    }

    if (!text || text.length < 10) {
      return res.status(404).json({
        message:
          "Text cannot be empty or should be more than at least 10 length",
      });
    }

    let newPost = new Post({
      user: userId,
      text: text,
    });

    newPost = await newPost.save();
    res.status(200).json({
      post: newPost,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error });
  }
}
export async function deletePost(req, res) {
  try {
    const userId = req.user._id;
    const postId = req.params.id;
    const post = await Post.findOneAndDelete({ _id: postId, user: userId });

    if (!post) {
      return res.status(404).json({
        message: "Post not found or you don't have permission to delete it",
      });
    }

    return res.status(200).json({ message: "Post deleted successfully", post });
  } catch (error) {
    console.log("Error in deletePost:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
}

export async function getAllPosts(req, res) {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (posts.length == 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong", error });
  }
}

export async function likeUnlikePost(req, res) {
  try {
    let user = req.user;
    const userId = user._id;
    const postId = req.params.id;
    const post = await Post.findOne({ _id: postId });

    if (!post) {
      return res.status(400).json({ message: "Post not found" });
    }
    const userLikedPost = post.likes.includes(userId);

    if (userLikedPost) {
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      return res.status(200).json({ message: "Post unliked successfully" });
    } else {
      post.likes.push(userId);
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      user.likedPost.push(postId);
      await user.save();
      await notification.save();
    }

    post.save();
    return res.status(200).json({ message: "Liked success" });
  } catch (error) {
    console.log("Error in deletePost:", error);
    return res.status(500).json({ message: "Something went wrong", error });
  }
}

export async function commentPost(req, res) {
  try {
    const userId = req.user._id;
    const postId = req.params.id;
    const text = req.body.text;
    if (!text) {
      return res.status(400).json({ message: "Comment cannont be empty" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(400).json({ message: "Post not found" });
    }

    const comment = { user: userId, text };
    post.comments.push(comment);
    post.save();
    return res.status(200).json({ message: "Commented success" });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" }, error);
  }
}

export async function getLikedPost(req, res) {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const posts = await Post.find({ likes: { $in: [userId] } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    return res.status(200).json({ message: "Liked post", posts });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
}

export async function getFollowingPost(req, res) {
  const userId = req.user._id;
  try {
    const followingUsers = req.user.following;
    const posts = await Post.find({ user: { $in: followingUsers } })
      .populate("user")
      .select("-password")
      .populate("comments.user")
      .select("-password")
      .sort({ createdAt: -1 }); // Optional: Sort posts by most recent

    res.status(200).json(posts);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
}

export async function getUserPost(req, res) {
  const userId = req.params.id;
  try {
    const followingUsers = req.user.following;
    const posts = await Post.find({ user: userId })
      .populate("user")
      .select("-password")
      .populate("comments.user")
      .select("-password")
      .sort({ createdAt: -1 }); 

    res.status(200).json(posts);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error });
  }
}
