const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const { isAuthenticated } = require("../middleware/jwt.middleware.js");

const saltRounds = 10;

// POST /auth/signup
router.post("/signup", (req, res, next) => {
  const {
    email,
    password,
    username,
    phoneNumber,
    address,
    profilePicture,
    city,
  } = req.body;

  // Check body format
  if (
    !email ||
    !password ||
    !username ||
    !phoneNumber ||
    !address ||
    !profilePicture ||
    !city
  ) {
    res.status(400).json({ message: "Please provide all fields" });
    return;
  }

  // Check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({
      message: "Please provide a valid email address.",
    });
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

  // Check user already exist
  User.findOne({ $or: [{ email }, { username }] })
    .then((foundUser) => {
      if (foundUser) {
        res.status(400).json({ message: "Username or email already exist." });
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
        profilePicture,
        city,
      });
    })
    .then((createdUser) => {
      if (!createdUser) return;

      const { _id, email, username, profilePicture, address, phoneNumber } =
        createdUser;
      const payload = {
        _id,
        email,
        username,
        profilePicture,
        address,
        phoneNumber,
      };

      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "6h",
      });

      res.status(201).json({ authToken: authToken });
    })
    .catch((err) => next(err));
});

// POST  /auth/login
router.post("/login", (req, res, next) => {
  const { email, password } = req.body;

  // Check body format
  if (!email || !password) {
    res.status(400).json({ message: "Please provide email and password." });
    return;
  }

  // Check email exist
  User.findOne({ email })
    .then((foundUser) => {
      if (!foundUser) {
        res.status(401).json({
          message:
            "Sorry, the provided email address could not be found in our system. ",
        });
        return;
      }

      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        const { _id, email, username, profilePicture, address, phoneNumber } =
          foundUser;
        const payload = {
          _id,
          email,
          username,
          profilePicture,
          address,
          phoneNumber,
        };

        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: "HS256",
          expiresIn: "6h",
        });

        res.status(200).json({ authToken: authToken });
      } else {
        res
          .status(401)
          .json({ message: "Oops! The password you entered is incorrect. " });
      }
    })
    .catch((err) => next(err));
});

// GET  /auth/verify
router.get("/verify", isAuthenticated, (req, res, next) => {
  res.status(200).json(req.payload);
});

module.exports = router;
