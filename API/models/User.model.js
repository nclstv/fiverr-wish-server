const { model, Schema } = require("mongoose");

const userSchema = new Schema({
  email: String,
  username: String,
  password: String,
  gigs: [{ type: Schema.Types.ObjectId, ref: "Service" }],
  phoneNumber: String,
  address: String,
  profilePicture: String,
});

const User = model("User", userSchema);

module.exports = User;
