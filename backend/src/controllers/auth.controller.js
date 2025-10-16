import User from "../models/user.model.js";
import { generateTokens, hashing } from "../lib/utils.js";
import debug from "debug";
const log = debug("auth.controller:log");
const error_log = debug("auth.controller:error");

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters" });
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });
    const hashedPassword = await hashing(password);
    const newUser = new User({
      email,
      fullName,
      password: hashedPassword,
    });
    if (newUser) {
      generateTokens(newUser._id, res);
      await newUser.save();
      res.status(200).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    }
  } catch (error) {
    error_log("error in signup: ", error.message);
    res.status(500).json({ message: "Internal Server Error" });
    throw error;
  }
};

export const login = (req, res) => {
  res.send("login route");
};

export const logout = (req, res) => {
  res.send("logout route");
};
