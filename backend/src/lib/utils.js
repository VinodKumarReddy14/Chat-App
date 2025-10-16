import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const hashing = async (word) => {
  const salt = bcryptjs.genSalt(10);
  return bcryptjs.hash(word, salt);
};

export const generateTokens = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
  return token;
};
