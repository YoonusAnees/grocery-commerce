import "dotenv/config";
import mongoose from "mongoose";

import { User } from "../models/model.user.mjs";

async function makeAdmin() {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    console.error("Please provide the existing user's email.");
    console.error("Example: node scripts/make-admin.mjs admin@example.com");
    process.exitCode = 1;
    return;
  }

  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing from your .env file.");
    process.exitCode = 1;
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const user = await User.findOneAndUpdate(
      { email },
      { $set: { role: "admin" } },
      {
        new: true,
        runValidators: true,
      },
    ).select("_id username email role");

    if (!user) {
      console.error(`No account found for: ${email}`);
      process.exitCode = 1;
      return;
    }

    console.log("Admin account is ready:");
    console.log({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error("Could not update the account:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

await makeAdmin();