import User from "../models/user.model.js";
import { generateTokens } from "../lib/utils.js";
import bcryptjs from "bcryptjs";
import debug from "debug";
const log = debug("auth.controller:log");
const error_log = debug("auth.controller:error");

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be atleast 6 characters" });
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);
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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email | !password) {
      res.status(400).json({ message: "All fields required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const match_password = await bcryptjs.compare(password, user.password);
    if (!match_password) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    generateTokens(user._id, res);
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    error_log(`error in login controller: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const logout = (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logout Successfully" });
  } catch (error) {
    error_log(`error in logout: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
