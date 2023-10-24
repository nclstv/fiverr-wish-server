const { Schema, model } = require("mongoose");

const ratingSchema = new Schema(
  {
    rating: {
      type: Number,
      required: [true, "Please provide a rating."],
      min: [1, "Please provide a minimum rating of 1."],
      max: 5,
    },
    comment: {
      type: String,
      maxLength: [500, "Your comment need to be less than 500 characters."],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
  },
  { timestamps: true }
);

const Rating = model("Rating", ratingSchema);

module.exports = Rating;
