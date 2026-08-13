import joi from "joi";
import validate from "./validationmiddleware.js";
const registeruserSchema = joi.object({
    name: joi.string().required().messages({
        "string.empty": "Name is required",
        "any.required": "Name is required"
    }),
    email: joi.string().email().required().messages({
        "string.email": "Please provide a valid email",
        "string.empty": "Email is required",
        "any.required": "Email is required"
    }),
    password: joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters",
        "string.empty": "Password is required",
        "any.required": "Password is required"
    })
});

const loginuserSchema=joi.object({
      email: joi.string().email().required().messages({
        "string.email": "Please provide a valid email",
        "string.empty": "Email is required",
        "any.required": "Email is required"
    }),
    password: joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters",
        "string.empty": "Password is required",
        "any.required": "Password is required"
    })
})

export const validateregisteruser=validate(registeruserSchema );
export const validateloginuser=validate(loginuserSchema)
