import mongoose from "mongoose";
import debug from "debug";
const log = debug("db:log");
const error_log = debug("db:error");

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    log(`Mongodb connected: ${conn.connection.host}`);
  } catch (error) {
    error_log("error in connecting mongodb: ", error.message);
    throw error;
  }
};
