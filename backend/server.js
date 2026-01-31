const cors = require("cors");
const express = require("express");
const connectDB = require("./db"); 

const app = express();
app.use(cors());
app.use(express.json());

// Helper to prevent crash on missing dependencies
const safeRequire = (path) => {
    try {
        return require(path);
    } catch (e) {
        console.error(`Failed to load route ${path}:`, e.message);
        return (req, res) => res.status(500).json({error: `Route not available: ${e.message}`});
    }
};

// Connect DB
connectDB();

// Routes
app.use("/api/auth", safeRequire("./routes/auth")); 
app.use("/api/records", safeRequire("./routes/records"));
app.use("/api/access", safeRequire("./routes/access"));

// Test endpoint
app.get("/", (req, res) => res.send("MedChain API Running"));

const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
    console.log("Press Ctrl+C to stop...");
});

// Force keep-alive
setInterval(() => {}, 10000);

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});
