import { User } from "../models/userModel.js";
import jwt from "jsonwebtoken";

export async function protectRoute(req, res, next) {
  try {
    console.log("called")
    const token = (req.cookies.jwt);
   
    if (!token) {
      return res
        .status(400)
        .json({ error: "Unauthorized Access : No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "Unauthorized : Invalid token" });
    }
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server error", error: error });
  }
}
