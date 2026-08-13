import express from "express";
import ordercontroller from "../controllers/order.controller.js";

const router = express.Router();
router.use("", ordercontroller);

export default router;
