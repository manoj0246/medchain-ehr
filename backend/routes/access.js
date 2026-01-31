const express = require("express");
const router = express.Router();
const AccessRequest = require("../models/AccessRequest");
const User = require("../models/User");

// Step 9: Request Access
router.post("/request", async (req, res) => {
    try {
        const { doctorId, patientId } = req.body;

        // Check if request already exists
        const existing = await AccessRequest.findOne({ doctorId, patientId, status: "Pending" });
        if (existing) return res.status(400).json({ error: "Request already pending" });

        const request = new AccessRequest({ doctorId, patientId });
        await request.save();

        res.json({ message: "Access request sent" });
    } catch (error) {
        res.status(500).json({ error: "Request Failed" });
    }
});

// Get pending requests for Patient
router.get("/pending/:patientId", async (req, res) => {
    try {
        const requests = await AccessRequest.find({ patientId: req.params.patientId, status: "Pending" });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: "Fetch Failed" });
    }
});

// Step 10: Respond to request (This is mainly for updating DB, actual permission is on blockchain)
// The frontend calls this AFTER successful blockchain transaction
router.post("/respond", async (req, res) => {
    try {
        const { requestId, status } = req.body; // Approved / Rejected
        await AccessRequest.findByIdAndUpdate(requestId, { status });
        res.json({ message: "Request updated" });
    } catch (error) {
        res.status(500).json({ error: "Update Failed" });
    }
});

module.exports = router;
