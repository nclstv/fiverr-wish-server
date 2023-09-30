const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  rating: Number,
  comment: String,
  user: String,
  service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
});

module.exports = mongoose.model("Rating", ratingSchema);
