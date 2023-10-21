const { model, Schema } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: /^\S+@\S+\.\S+$/,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    phoneNumber: {
      type: String,
    },
    address: String,
    profilePicture: String,
    city: String,
  },
  { timestamps: true }
);

const User = model("User", userSchema);

module.exports = User;
