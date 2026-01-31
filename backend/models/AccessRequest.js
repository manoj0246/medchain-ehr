const mongoose = require("mongoose");

const AccessRequestSchema = new mongoose.Schema({
  patientId: { type: String, required: true },
  doctorId: { type: String, required: true },
  status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AccessRequest", AccessRequestSchema);
