const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  email: {
    type: String, required: true, unique: true, lowercase: true,
    trim: true, maxlength: 254, index: true
  },
  username: {
    type: String, required: true, unique: true, trim: true,
    minlength: 3, maxlength: 30, match: /^[a-zA-Z0-9_.-]+$/
  },
  passwordHash: { type: String, required: true, select: false },
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

userSchema.methods.verifyPassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model("User", userSchema);