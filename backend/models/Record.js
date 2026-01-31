const mongoose = require("mongoose");

const RecordSchema = new mongoose.Schema({
  recordId: { type: String, required: true, unique: true },
  patientId: { type: String, required: true }, // Link to Patient UserID
  doctorId: { type: String, required: true },  // Link to Doctor UserID (Creator)
  
  // Medical Data
  disease: String,
  reason: String,
  precautions: String,
  medicines: String,
  
  // Off-chain file storage
  attachmentUrl: String, 
  
  // Blockchain Reference
  blockchainHash: String, // The hash stored on blockchain
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Record", RecordSchema);
