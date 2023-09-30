const { Schema, model } = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  gigs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  phone_number: String,
  address: {},
  profilePicture: String,
});

const User = model("User", userSchema);

module.exports = User;
