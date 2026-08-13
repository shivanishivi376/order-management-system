import express from "express";
const router=express.Router()
import usercontroller from "../controllers/user.controller.js"
router.use("/auth",usercontroller)
export default router;