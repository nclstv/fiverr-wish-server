const express = require("express");
const router = express.Router();
const User = require("../models/User.model");
const bcrypt = require("bcrypt");
const { isAuthenticated } = require("../middleware/jwt.middleware");

router.get("/profile", isAuthenticated, async (req, res) => {
  try {
    const user = req.payload;
    const userFound = await User.findOne({ _id: user._id });

    if (!userFound) {
      return res.status(404).json({ errorMessage: "User not found" });
    }

    const { username, phoneNumber, email } = userFound;
    const response = { username, phoneNumber, email };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

router.put("/profile/edit", isAuthenticated, async (req, res) => {
  try {
    const user = req.payload;
    const { email, username, phoneNumber } = req.body;

    const updateFields = { email, username, phoneNumber };

    const updatedUser = await User.findByIdAndUpdate(user._id, updateFields, {
      new: true,
      runValidators: true,
    });

    const response = {
      username: updatedUser.username,
      email: updatedUser.email,
      phoneNumber: updatedUser.phoneNumber,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
});

router.put("/profile/edit/password", isAuthenticated, async (req, res) => {
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
