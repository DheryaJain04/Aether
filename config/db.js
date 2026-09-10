const mongoose = require("mongoose");
const dns = require("dns");

async function connectDB(){
    // Set reliable public DNS servers to resolve MongoDB Atlas SRV records smoothly on Windows/ISP networks
    try {
        dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch {
        // Ignore if restricted in certain runtime environments
    }

    const primaryUri = process.env.MONGODB_URI;
    const localUri = "mongodb://127.0.0.1:27017/aether";

    try {
        if (primaryUri) {
            // Attempt remote connection with a 10-second timeout
            await mongoose.connect(primaryUri, {
                serverSelectionTimeoutMS: 10000
            });
            console.log("MongoDB connected successfully (Remote Atlas Cluster)");
            return;
        }
    } catch (err) {
        console.warn(`Remote MongoDB Atlas connection failed (${err.message}). Trying local MongoDB...`);
    }

    // Fallback to local MongoDB instance
    try {
        await mongoose.connect(localUri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("MongoDB connected successfully (Local Instance: mongodb://127.0.0.1:27017/aether)");
    } catch (localErr) {
        console.error("Local MongoDB connection also failed:", localErr.message);
    }
}

module.exports = connectDB;