import { User } from "../models/userModel.js";
import Notification from "../models/notificationModel.js";
import bcrypt from "bcryptjs/dist/bcrypt.js";

export async function getUserProfile(req, res) {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username: username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "error", error });
    console.log("Error in getUserProfile");
  }
}

export async function followUnfollowUser(req, res) {
  const { id } = req.params;
  try {
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user._id);

    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ errro: "You can't follow or unfollow yourself" });
    }

    if (!userToModify || !currentUser) {
      return res.status(400).json({ error: "User not found" });
    }

    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // Unfollow the user
      await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });
      res.status(200).json({ message: "User unfollowed success" });
    } else {
      // Follow the user
      await User.findByIdAndUpdate(id, {
        $push: { followers: req.user._id },
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: { following: id },
      });
      const newNotification = new Notification({
        from: req.user._id,
        to: id,
        type: "follow",
      });
      await newNotification.save();

      // TODO : return the id of user he response
      res.status(200).json({ message: "User Followed success" });
    }
  } catch (error) {
    console.log("Error in followUnfollowUser controller");
    return res.status(500).json({ error: error.message });
  }
}

export async function getSuggestedUsers(req, res) {
  try {
    const userId = req.user._id;
    const usersFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);
    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );
    const suggestedUsers = filteredUsers.slice(0, 4);
    suggestedUsers.forEach((user) => (user.password = null));
    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in SUGGESTED USER", error);
    res.status(500).json({ message: "Error in SUGGESTED USER" });
  }
}

export async function updateUser(req, res) {
  const { fullname, email, username, bio, link } = req.body;
  const userId = req.user._id;

  try {
    let user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    // if (
    //   (!newPassword && currentPassword) ||
    //   !(currentPassword && newPassword)
    // ) {
    //   return res.status(400).json({
    //     error: "Please provide both current password and new password",
    //   });
    // }
    // if (currentPassword && newPassword) {
    // const isMatch = bcrypt.compare(currentPassword, user.password);
    // if (!isMatch) {
    //   return res.status(400).json({ error: "Current password is incorrect" });
    // }
    // if (newPassword < 6) {
    //   return res.status(400).json({});
    // }
    // const salt = await bcrypt.genSalt(10);
    // user.password = await bcrypt.hash(newPassword, salt);
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.link = link || user.link;

    user = await user.save();
    user.password = null;
    return res.status(200).json(user);
    // }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
}
