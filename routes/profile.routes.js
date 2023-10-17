const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const { payload } = req;
    const user = await User.findOne({ _id: payload.sub });

    if (!user) {
      return res.status(404).json({ errorMessage: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Internal server error" });
  }
});
router.put("/profile/edit", isAuthenticated, async (req, res) => {
  try {
    const { payload } = req;
    const { email, username, phoneNumber } = req.body;

    if (!email && !username && !phoneNumber) {
      return res.status(400).json({
        errorMessage:
          "At least one field (email, username, or phoneNumber) is required for update.",
      });
    }

    if (email) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      const emailTest = emailPattern.test(email);
      if (!emailTest) {
        return res.status(400).json({
          errorMessage: "Invalid email format. Please provide a valid email.",
        });
      }

      const userWithSameEmail = await User.findOne({ email });
      if (
        userWithSameEmail &&
        userWithSameEmail._id.toString() !== payload.sub
      ) {
        return res.status(400).json({
          errorMessage: "Email is already in use. Please use a different one.",
        });
      }
    }

    if (phoneNumber && phoneNumber.length > 15) {
      return res.status(400).json({
        errorMessage: "Phone number should not exceed 15 characters.",
      });
    }

    const updateFields = {};
    if (email) updateFields.email = email;
    if (username) updateFields.username = username;
    if (phoneNumber) updateFields.phoneNumber = phoneNumber;

    await User.updateOne({ _id: payload.sub }, updateFields);
    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Internal server error" });
  }
});

router.post("/profile/edit/password", isAuthenticated, async (req, res) => {
  const { payload } = req;
  const { oldPassword, newPassword } = req.body;

  try {
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ errorMessage: "All fields are required." });
    }

    const user = await User.findOne({ _id: payload.sub });
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      user.passwordHash
    );

    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ errorMessage: "Invalid old password. Please try again." });
    }

    const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    const passwordTest = passwordPattern.test(newPassword);
    if (!passwordTest) {
      return res.status(400).json({
        errorMessage:
          "The new password must be 6 to 30 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ _id: payload.sub }, { passwordHash });
    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ errorMessage: "Internal server error" });
  }
});

module.exports = router;
