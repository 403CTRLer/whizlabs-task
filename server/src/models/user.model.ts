import { Schema, model } from "mongoose";

/**
 * Interface for User
 * Represents the structure of a user in the system
 */
export interface IUser {
  email: string;
  password: string;
  role: "admin" | "user";
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * User Schema
 * Defines the MongoDB schema for users with validation
 */
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      // Password is hashed before saving, so we don't need min length here
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create and export the User model
export const UserModel = model<IUser>("User", UserSchema);

