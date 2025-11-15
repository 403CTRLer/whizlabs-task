import mongoose from "mongoose";

export async function connectDB(uri?: string) {
  const mongoUri = uri || process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGO_URI not provided");
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");
}
