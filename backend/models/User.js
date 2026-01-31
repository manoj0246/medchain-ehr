const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true, required: true }, // P1001, D2001
  name: { type: String, required: true },
  role: { type: String, enum: ["Patient", "Doctor"], required: true },
  walletAddress: { type: String, required: true },
  
  // Patient specific
  age: Number,
  gender: String,
  bloodGroup: String,

  // Doctor specific
  specialization: String 
});

module.exports = mongoose.model("User", UserSchema);
