import mongoose from "mongoose";

const connectDb = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("MONGODB CONNECTED SUCCESSFULLY");
    } catch (err) {
        console.log("mongodb connection err ", err.message);
        process.exit(1);
    }
};

export default connectDb;
