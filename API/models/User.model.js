const { model, Schema } = require("mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^\S+@\S+\.\S+$/,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    minLength: 3,
    maxLength: 30,
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
  phone_number: {
    type: String,
    maxLength: 15,
  },
  address: {},
  profilePicture: String,
});

const User = model("User", userSchema);

module.exports = User;
