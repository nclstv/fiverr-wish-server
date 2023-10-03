const { Schema, model } = require("mongoose");
const serviceSchema = new Schema({
  title: {
    type: String,
    required: true,
    maxLength: 100,
  },
  description: {
    type: String,
    required: true,
    maxLength: 2500,
  },
  image: String,
  estimatepriceperday: {
    type: Number,
    required: true,
    min: 0,
  },
  rating: {
    type: Schema.Types.ObjectId,
    ref: "Rating",
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  userpending: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  userAccept: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

const Service = model("Service", serviceSchema);

module.exports = Service;
