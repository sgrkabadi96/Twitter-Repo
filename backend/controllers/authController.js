import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";

export async function signup(req, res) {
  try {
    const { fullname, username, password, email } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken." });
    }
    const existingMail = await User.findOne({ email });
    if (existingMail) {
      return res.status(400).json({ error: "Email address is already used." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      fullname,
      password: hashedPassword,
      email,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      const userToSend = newUser.toObject();
      delete userToSend.password;
      return res.status(201).json({
        message: "User has been created successfully",
        newUser: userToSend,
      });
    } else {
      return res.status(400).json({ message: "Failed in creating user" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal Server error in signup, please try again later.",
    });
  }
}
export async function login(req, res) {
  console.log("login_called");
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({
        error: "Invalid username or password",
      });
    }
    generateTokenAndSetCookie(user._id, res);
    const userToSend = user.toObject();
    delete userToSend.password;
    return res.status(201).json({
      message: "Logged in successfully",
      user: userToSend,
    });

    return;
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: "Internal Server error in login, please try again later.",
    });
  }
}

export function logout(req, res) {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({
      message: "Logout success ",
    });
  } catch (error) {
    console.log("Error in logout controller");
    res.status(500).json({
      message: "Error in loggin out",
    });
  }
}

export function getMe(req, res) {
  try {
    return res
      .status(201)
      .json({ message: "This is your details", user: req.user });
  } catch (error) {
    console.log("Error in getMe controller");
    return res.status.json({ message: "Internal Server Error", error });
  }
}
