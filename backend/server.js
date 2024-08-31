import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";

import connecToDb from "./db/db.js";


dotenv.config();
const app = express();
const PORT = process.env.PORT;

// Apply middleware before routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());
app.use(morgan("dev"));

// Define routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);

app.listen(PORT, () => {
  console.log(`Server is running on PORT :: ${PORT}`);
  connecToDb(); // Connect to the database after starting the server
});
