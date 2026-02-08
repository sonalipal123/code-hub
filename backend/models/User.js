// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    bookmarks: { type: [String], default: [] }, // store example IDs like "hello-1"
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
