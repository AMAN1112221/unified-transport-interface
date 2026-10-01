const mongoose = require("mongoose");

const connectDB = async () => {
    const connectionString = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/uti";
    await mongoose.connect(connectionString);
    console.log("MongoDB connected");
};

module.exports = connectDB;