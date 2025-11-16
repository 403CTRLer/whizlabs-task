import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { connectDB } from "./db";
import { seedUsers } from "./seeders/user.seeder";

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB(process.env.MONGO_URI);
  
  // Seed users in development mode
  if (process.env.NODE_ENV === "development") {
    await seedUsers();
  }
  
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
