import mongoose from "mongoose";

export default async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is required. Set it in backend/.env or the deployment environment.");
  }

  await mongoose.connect(uri);
  console.log("MongoDB connected successfully.");
}