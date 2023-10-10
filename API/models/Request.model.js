const { model, Schema } = require("mongoose");

const requestModel = new Schema(
  {
    requestUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "Service",
    },
    status: {
      type: String,
      default: "pending",
      enum: ["authorized", "denied", "pending"],
    },
  },
  { timestamps: true }
);

const Request = model("Request", requestModel);

module.exports = Request;
