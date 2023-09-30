const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema({
  title: String,
  description: String,
  image: String,
  estimatepriceperday: Number,
  rating: { type: mongoose.Schema.Types.ObjectId, ref: "Rating" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userpending: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  userAccept: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("Service", serviceSchema);
