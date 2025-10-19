import cloudinary from "../lib/cloudinary.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import debug from "debug";
const log = debug("message.controller:log");
const error_log = debug("message.controller:error");

export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const filteredUsers = await User.find({ _id: { $ne: userId } })
      .select("-password")
      .lean();
    res.status(200).json(filteredUsers);
  } catch (error) {
    error_log(`error in message controller: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id.toString();
    const messages = Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });
    res.status(200).json(messages);
  } catch (error) {
    error_log(`error in getMessages Controller: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const { myId } = req.user._id.toString();
    const { text, image } = req.body;
    let imageURI;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageURI = uploadResponse.secure_url;
    }
    const newMessage = new Message({
      senderId: myId,
      receiverId: receiverId,
      text,
      image: imageURI,
    });
    await newMessage.save();
    //todo: realtime functionality using socket.io
    res.status(200).json(newMessage);
  } catch (error) {
    error_log(`error in sendMessageController: ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
