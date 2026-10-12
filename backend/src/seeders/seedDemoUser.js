require("dotenv").config({
  path: require("path").resolve(__dirname, "../../../.env"),
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("../config/db");
const User = require("../models/User");

const DEMO_USER = {
  username: "demo_user",
  email: "demo@gatehouse.local",
  password: "GatehouseDemo@2026!",
};

async function seedDemoUser() {
  try {
    await connectDB();

    const passwordHash = await bcrypt.hash(
      DEMO_USER.password,
      12
    );

    let user = await User.findOne({
      email: DEMO_USER.email,
    });

    if (user) {
      // Reset the demo account to the known credentials.
      user.username = DEMO_USER.username;
      user.passwordHash = passwordHash;

      await user.save();

      console.log("Existing demo user updated.");
    } else {
      // Avoid conflicting with another user's username.
      const usernameExists = await User.findOne({
        username: DEMO_USER.username,
      });

      if (usernameExists) {
        throw new Error(
          "Username demo_user already belongs to another account."
        );
      }

      user = await User.create({
        username: DEMO_USER.username,
        email: DEMO_USER.email,
        passwordHash,
      });

      console.log("Demo user created successfully.");
    }

    console.log("\nDemo login credentials");
    console.log("----------------------");
    console.log(`Email:    ${DEMO_USER.email}`);
    console.log(`Username: ${DEMO_USER.username}`);
    console.log(`Password: ${DEMO_USER.password}`);
    console.log("----------------------");
    console.log("You can now sign in through Gatehouse.");
  } catch (error) {
    console.error("Demo user seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
}

seedDemoUser();
