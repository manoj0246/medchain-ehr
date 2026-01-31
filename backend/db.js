const mongoose = require("mongoose");

// Password@123 encoded as Password%40123 to handle the '@' symbol correctly in the URI
const MONGO_URI = "mongodb+srv://admin:Password%40123@admin.ix4ow0p.mongodb.net/ehr_db?appName=admin"; 

const connectDB = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 5000 
        });
        console.log("MongoDB connected");
        return true;
    } catch (err) {
        console.error("MongoDB Connection Failed:", err.message);
        return false;
    }
};

module.exports = connectDB;
