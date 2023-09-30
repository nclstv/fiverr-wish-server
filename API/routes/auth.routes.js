const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

const saltRounds = 10;

// POST /auth/signup
router.post("/signup", (req, res, next) => {
  const { email, password, username, phoneNumber, address } = req.body;

  // Check body format
  if ((!email, !password, !username, !phoneNumber, !address)) {
    res.status(400).json({ message: "Provide all fields" });
    return;
  }

  // Check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Provide a valid email address." });
    return;
  }

  // Check password format
  const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({
      message:
        "Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.",
    });
    return;
  }

  // Check username format
  const ussernameRegex = /^[a-zA-Z0-9]{3,15}$/;
  if (!ussernameRegex.test(username)) {
    res.status(400).json({
      message: "Invalid Username format. Format need to be alphanumeric.",
    });
    return;
  }

  // Check user already exist
  User.findOne({ email })
    .then((foundUser) => {
      if (foundUser) {
        res.status(400).json({ message: "User already exists." });
        return;
      }

      const salt = bcrypt.genSaltSync(saltRounds);
      const hashedPassword = bcrypt.hashSync(password, salt);

      return User.create({
        email,
        password: hashedPassword,
        username,
        address,
        phoneNumber,
      });
    })
    .then((createdUser) => {
      if (!createdUser) return;
      res.status(201).json({ message: "User created" });
    })
    .catch((err) => next(err));
});

// POST  /auth/login
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  // Check body format
  if (!email || !password) {
    res.status(400).json({ message: "Provide email and password." });
    return;
  }

  // Check email exist
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        res.status(401).json({ message: "User not found." });
        return;
      }

      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        const { _id, email, username } = foundUser;
        const payload = { _id, email, username };

        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        res.status(200).json({ authToken: authToken });
      } else {
        res.status(401).json({ message: "Unable to authenticate the user" });
      }
    })
    .catch((err) => next(err));
});

// GET  /auth/verify
router.get("/verify", isAuthenticated, (req, res, next) => {
  res.status(200).json(req.payload);
});

module.exports = router;
