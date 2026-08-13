import express from "express";
import auth from "../middlewares/auth.middleware.js";
import admin from "../middlewares/admin.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
    validateCreateOrder,
    validateUpdateOrder,
} from "../middlewares/ordervalidation.js";
import {
    getorderbyid,
    getorders,
    getallorders,
    createorder,
    updateorder,
    deleteorder,
} from "../services/order.service.js";

const router = express.Router();

router.post("/orders", auth, upload.single("image"), validateCreateOrder, async (req, res, next) => {
    try {
        const imageUrl = req.file ? req.file.path : undefined;
        const order = await createorder(req.user.id, req.body, imageUrl);
        res.status(201).json({
            success: true,
            message: "Order created successfully",
            order,
        });
    } catch (err) {
        next(err);
    }
});

router.get("/orders", auth, async (req, res, next) => {
    try {
        const result = await getorders(req.user.id, req.query);
        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            ...result,
        });
    } catch (err) {
        next(err);
    }
});

router.get("/admin/orders", auth, admin, async (req, res, next) => {
    try {
        const result = await getallorders(req.query);
        res.status(200).json({
            success: true,
            message: "All orders fetched successfully",
            ...result,
        });
    } catch (err) {
        next(err);
    }
});

router.get("/orders/:id", auth, async (req, res, next) => {
    try {
        const order = await getorderbyid(req.user.id, req.params.id);
        res.status(200).json({
            success: true,
            message: "Order fetched successfully",
            order,
        });
    } catch (err) {
        next(err);
    }
});

router.put(
    "/orders/:id",
    auth,
    upload.single("image"),
    validateUpdateOrder,
    async (req, res, next) => {
        try {
            const imageUrl = req.file ? req.file.path : undefined;
            const order = await updateorder(
                req.user.id,
                req.params.id,
                req.body,
                imageUrl
            );
            res.status(200).json({
                success: true,
                message: "Order updated successfully",
                order,
            });
        } catch (err) {
            next(err);
        }
    }
);

router.delete("/orders/:id", auth, async (req, res, next) => {
    try {
        await deleteorder(req.user.id, req.params.id);
        res.status(200).json({
            success: true,
            message: "Order deleted successfully",
        });
    } catch (err) {
        next(err);
    }
});

export default router;
