const express = require("express");
const User = require("../models/User");
const router = express.Router();

// POST: Create a new user
router.post("/create", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Create a new user
    const user = await User.create({ email });

    res.status(201).json({ message: "User created successfully", user });
  } catch (error) {
    if (error.code === 11000) { // Duplicate email
      res.status(400).json({ message: "User already exists" });
    } else {
      res.status(500).json({ message: "Server error", error });
    }
  }
});

module.exports = router;
