import express from "express";
import authRouter from "./routes/authRouter.js";
import dotenv from "dotenv";
import connecToDb from "./db/db.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();
const PORT = process.env.PORT;

// Apply middleware before routes
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());

// Define routes
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Server is running on PORT :: ${PORT}`);
  connecToDb(); // Connect to the database after starting the server
});
