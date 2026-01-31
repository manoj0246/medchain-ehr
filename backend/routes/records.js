const express = require("express");
const router = express.Router();
const Record = require("../models/Record");
const User = require("../models/User");

// STEP 6: Off-chain storage
router.post("/add", async (req, res) => {
    try {
        const { patientId, doctorId, disease, reason, precautions, medicines, attachmentUrl } = req.body;

        // Verify users exist
        const patient = await User.findOne({ userId: patientId });
        const doctor = await User.findOne({ userId: doctorId });
        
        if (!patient || !doctor) return res.status(404).json({ error: "User not found" });

        // Generate unique Record ID (e.g., hash or UUID)
        // In real world, IPFS CID would come here. We simulate CID with a random string or DB ID.
        const recordId = "REC-" + Date.now(); 

        const newRecord = new Record({
            recordId,
            patientId,
            doctorId,
            disease,
            reason,
            precautions,
            medicines,
            attachmentUrl,
            blockchainHash: recordId // using recordId as the 'cid' for blockchain
        });

        await newRecord.save();
        
        res.json({ 
            success: true, 
            message: "Record stored off-chain", 
            cid: recordId, // This is what goes to blockchain
            patientAddress: patient.walletAddress 
        });

    } catch (error) {
        console.error("Add Record Error", error);
        res.status(500).json({ error: "Failed to save record" });
    }
});

// Fetch record details (Called after getting hash from blockchain)
router.get("/get/:cid", async (req, res) => {
    try {
        const record = await Record.findOne({ blockchainHash: req.params.cid });
        if (!record) return res.status(404).json({ error: "Record details not found off-chain" });
        res.json(record);
    } catch (error) {
        res.status(500).json({ error: "Fetch error" });
    }
});

// Get all records for a patient (For Step 7 simple view if off-chain sync desired, but blockchain is source of truth)
router.get("/patient/:patientId", async (req, res) => {
    try {
        const records = await Record.find({ patientId: req.params.patientId });
        res.json(records);
    } catch (error) {
        res.status(500).json({ error: "Fetch error" });
    }
});

module.exports = router;
