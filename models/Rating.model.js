const { Schema, model } = require("mongoose");

const ratingSchema = new Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxLength: 500,
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
