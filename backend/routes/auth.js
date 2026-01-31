const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Generate ID Helper
async function generateId(role) {
    const prefix = role === "Patient" ? "P" : "D";
    const startNum = role === "Patient" ? 1000 : 2000;
    
    // Get last created user from MongoDB
    const lastUser = await User.findOne({ role }).sort({ _id: -1 }); 
    
    if (!lastUser) {
        return `${prefix}${startNum + 1}`;
    }

    // Attempt to parse previous ID
    const lastIdNum = parseInt(lastUser.userId.substring(1));
    if (isNaN(lastIdNum)) return `${prefix}${startNum + 1}`;
    
    return `${prefix}${lastIdNum + 1}`;
}

router.post("/register", async (req, res) => {
    try {
        const { name, role, walletAddress, age, gender, bloodGroup, specialization } = req.body;
        
        // Check if wallet already registered
        const existing = await User.findOne({ walletAddress });
        if (existing) {
            return res.status(400).json({ error: "Wallet already registered", userId: existing.userId });
        }

        const userId = await generateId(role);
        
        const newUser = new User({
            userId,
            name, 
            role, 
            walletAddress,
            ...(role === "Patient" ? { age, gender, bloodGroup } : { specialization })
        });

        await newUser.save();
        res.json({ message: "Registered Successfully", userId, role });

    } catch (error) {
        console.error("Register Error", error);
        res.status(500).json({ error: "Registration Failed: " + error.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findOne({ userId });
        
        if (!user) return res.status(404).json({ error: "User not found" });

        res.json({ 
            success: true,
            name: user.name,
            role: user.role,
            userId: user.userId,
            walletAddress: user.walletAddress 
        });

    } catch (error) {
        res.status(500).json({ error: "Login Failed: " + error.message });
    }
});

// Helper for other routes to get wallet address
router.get("/resolve/:userId", async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.params.userId });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({ walletAddress: user.walletAddress });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
