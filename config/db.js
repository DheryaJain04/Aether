const mongoose = require("mongoose");

async function connectDB(){
    const primaryUri = process.env.MONGODB_URI;
    const localUri = "mongodb://127.0.0.1:27017/aether";

    try {
        if (primaryUri) {
            // Attempt remote connection with a 3-second timeout
            await mongoose.connect(primaryUri, {
                serverSelectionTimeoutMS: 3000
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
            serverSelectionTimeoutMS: 3000
        });
        console.log("MongoDB connected successfully (Local Instance: mongodb://127.0.0.1:27017/aether)");
    } catch (localErr) {
        console.error("Local MongoDB connection also failed:", localErr.message);
    }
}

module.exports = connectDB;