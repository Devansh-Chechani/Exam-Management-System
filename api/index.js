import express from "express";
import dotenv from "dotenv";
import User from "./model/userSchema.js";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcryptjs";
import { Authenticate } from "./middleware/authenticate.js";
import cookieParser from "cookie-parser";
const app = express();
dotenv.config();
app.use(
  cors({
    credentials: true, // Allow credentials (cookies) to be sent
    origin: "http://localhost:3000", // Replace with your frontend URL
  })
);
app.use(express.json());
app.use(bodyParser.json());
app.use(cookieParser());
const Connection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });
    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("There is some error while connecting the database", error);
  }
};

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log(req.body);

  // try {
  //   const user = await User.findOne({ email });
  //   if (user) return res.status(422).json({ error: "Email Already exists" });
  //   const userData = new User({ email, password });
  //   await userData.save();
  // } catch (error) {
  //   console.error("Error during signup:", error);
  // }

  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    const token = await user.generateAuthToken();
    console.log(token);
    //res.cookie("test1","hello")
    res.cookie("jwtoken", token, {
      expires: new Date(Date.now() + 250000),
      httpOnly: true,
      
    });
    // Check if the password is correct
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // If both email and password are correct, send a success response
    return res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});
app.get("/protected-route", Authenticate, (req, res) => {
  // Access user information from req.user
  //res.cookie("test2","hello")
  const user = req.user;
  res.status(200).json({ message: "This is a protected route", user });
});

app.listen(3001, (req, res) => {
  console.log("app is listening on port 8000");
});

Connection();
