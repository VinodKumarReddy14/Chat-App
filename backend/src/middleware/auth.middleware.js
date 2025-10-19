import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import debug from "debug";
const log = debug("auth.middleware:log");
const error_log = debug("auth.middleware:error");

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token)
      return res
        .status(400)
        .json({ message: "Unauthorised - No Token Provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded)
      return res.status(400).json({ message: "Unauthorised - Invalid Token" });
    const user = await User.findById(decoded.userId).select("-password").lean();
    if (!user) {
      return res.status(400).json({ message: "User not Found" });
    }
    req.user = user;
    next();
  } catch (error) {
    error_log(`error in protectRoute: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
