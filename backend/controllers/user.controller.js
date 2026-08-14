import express from "express";
import { validateregisteruser, validateloginuser } from "../middlewares/uservalidation.js";
import { registeruser, loginuser } from "../services/user.service.js";

const router = express.Router();

router.post("/signup", validateregisteruser, async (req, res, next) => {
    try {
        const user = await registeruser(req.body);
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user,
        });
    } catch (err) {
        next(err);
    }
});

router.post("/login", validateloginuser, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await loginuser(email, password);
        res.status(200).json({
            success: true,
            message: "Login successful",
            ...result,
        });
    } catch (err) {
        next(err);
    }
});

export default router;
