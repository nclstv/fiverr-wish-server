const { Schema, model } = require("mongoose");
const User = require("./User.model");
const serviceSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      maxLength: [100, "Title must be less than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxLength: [2500, "Description must be less than 2500 characters"],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
    },
    image: String,
    estimatePricePerDay: {
      type: Number,
      required: [true, "Estimate price per day is required"],
      min: [0, "Estimate price per day must be at least 0"],
    },
    ratings: [
      {
        type: Schema.Types.ObjectId,
        ref: "Rating",
      },
    ],
  },
  { timestamps: true }
);

const Service = model("Service", serviceSchema);

module.exports = Service;
