import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import userroutes from "./routes/user.routes.js";
import orderroutes from "./routes/order.routes.js";
import errorhandler from "./middlewares/error.middleware.js";

const app = express();
const PORT = 4000;

dotenv.config();
connectDb();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Server is healthy",
        timestamp: new Date().toISOString(),
    });
});

app.use("/api", userroutes);
app.use("/api", orderroutes);

app.use(errorhandler);

app.listen(PORT, () => {
    console.log(`server is running on ${PORT}`);
});
