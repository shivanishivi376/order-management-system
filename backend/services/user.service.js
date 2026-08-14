import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const toSafeUser = (user) => {
    const { password, ...safeUser } = user.toObject();
    return safeUser;
};

export const registeruser = async (data) => {
    const isexisting = await User.findOne({ email: data.email });
    if (isexisting) {
        const err = new Error("user already exists");
        err.statusCode = 400;
        throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const hashpass = await bcrypt.hash(data.password, salt);
    const user = await User.create({
        ...data,
        password: hashpass,
    });

    return toSafeUser(user);
};

export const loginuser = async (email, password) => {
    // Password is hidden by default in the schema and is loaded only to verify login.
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        const err = new Error("Invalid email or password");
        err.statusCode = 401;
        throw err;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        const err = new Error("Invalid email or password");
        err.statusCode = 401;
        throw err;
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });

    return { user: toSafeUser(user), token };
};
