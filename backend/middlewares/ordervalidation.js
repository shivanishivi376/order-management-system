import joi from "joi";
import validate from "./validationmiddleware.js";

const orderStatusValues = ["Pending", "Shipped", "Delivered", "Cancelled"];

const createOrderSchema = joi.object({
    productName: joi.string().trim().required().messages({
        "string.empty": "Product name is required",
        "any.required": "Product name is required",
    }),
    quantity: joi.number().integer().min(1).required().messages({
        "number.min": "Quantity must be at least 1",
        "any.required": "Quantity is required",
    }),
    price: joi.number().min(0).required().messages({
        "number.min": "Price cannot be negative",
        "any.required": "Price is required",
    }),
    address: joi.string().trim().required().messages({
        "string.empty": "Address is required",
        "any.required": "Address is required",
    }),
    status: joi
        .string()
        .valid(...orderStatusValues)
        .default("Pending"),
    image: joi.string().uri().optional(),
});

const updateOrderSchema = joi
    .object({
        productName: joi.string().trim(),
        quantity: joi.number().integer().min(1),
        price: joi.number().min(0),
        address: joi.string().trim(),
        status: joi.string().valid(...orderStatusValues),
        image: joi.string().uri().optional(),
    })
    .min(1)
    .messages({
        "object.min": "At least one field is required to update",
    });

export const validateCreateOrder = validate(createOrderSchema);
export const validateUpdateOrder = validate(updateOrderSchema);
