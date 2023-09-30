const { model, default: mongoose } = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  password: String,
  gigs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  phoneNumber: String,
  address: String,
  profilePicture: String,
});

const User = model("User", userSchema);

module.exports = User;
