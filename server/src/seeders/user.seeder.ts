import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "../db";
import { UserModel } from "../models/user.model";
import bcrypt from "bcrypt";

/**
 * Seed Users
 * Creates admin and user accounts if they don't already exist (idempotent)
 */
export async function seedUsers() {
  try {
    // Connect to database
    await connectDB(process.env.MONGO_URI);

    const users = [
      {
        email: "admin@example.com",
        password: "AdminPass123!",
        role: "admin" as const,
      },
      {
        email: "user@example.com",
        password: "UserPass123!",
        role: "user" as const,
      },
    ];

    for (const userData of users) {
      const existing = await UserModel.findOne({ email: userData.email });
      if (existing) {
        console.log(`User ${userData.email} already exists. Skipping.`);
        continue;
      }

      // Hash password before saving
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await UserModel.create({
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
      });
      console.log(`Created ${userData.role} user: ${user.email}`);
    }
  } catch (error) {
    console.error("Error seeding users:", error);
    throw error;
  }
}

// Allow running directly: ts-node src/seeders/user.seeder.ts
if (require.main === module) {
  seedUsers()
    .then(() => {
      console.log("User seeding completed");
      process.exit(0);
    })
    .catch((err) => {
      console.error("User seeding failed:", err);
      process.exit(1);
    });
}

