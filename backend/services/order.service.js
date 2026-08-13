import Order from "../models/order.model.js";

export const createorder = async (userId, data, imageUrl) => {
    const order = await Order.create({
        userId,
        productName: data.productName,
        quantity: data.quantity,
        price: data.price,
        address: data.address,
        status: data.status,
        image: imageUrl,
    });
    return order;
};

export const getorders = async (userId, queryOptions) => {
    const { status, page = 1, limit = 10 } = queryOptions || {};
    const query = { userId };
    if (status) {
        query.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
        .populate("userId", "name email")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const totalOrders = await Order.countDocuments(query);

    return {
        orders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: Number(page),
        totalOrders,
    };
};

export const getallorders = async (queryOptions) => {
    const { status, page = 1, limit = 10 } = queryOptions || {};
    const query = {};
    if (status) {
        query.status = status;
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
        .populate("userId", "name email")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const totalOrders = await Order.countDocuments(query);

    return {
        orders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: Number(page),
        totalOrders,
    };
};

export const getorderbyid = async (userId, orderId) => {
    const order = await Order.findOne({ _id: orderId, userId }).populate(
        "userId",
        "name email"
    );
    if (!order) {
        const err = new Error("Order not found");
        err.statusCode = 404;
        throw err;
    }
    return order;
};

export const updateorder = async (userId, orderId, data, imageUrl) => {
    if (imageUrl) {
        data.image = imageUrl;
    }
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
        const err = new Error("Order not found");
        err.statusCode = 404;
        throw err;
    }

    if (data.status && data.status !== order.status) {
        const statusOrder = { "Pending": 1, "Shipped": 2, "Delivered": 3, "Cancelled": 4 };
        if (statusOrder[data.status] < statusOrder[order.status] && order.status !== "Cancelled") {
            const err = new Error(`Cannot change status from ${order.status} to ${data.status}`);
            err.statusCode = 400;
            throw err;
        }
    }

    Object.assign(order, data);
    await order.save();
    return order;
};

export const deleteorder = async (userId, orderId) => {
    const order = await Order.findOneAndDelete({ _id: orderId, userId });
    if (!order) {
        const err = new Error("Order not found");
        err.statusCode = 404;
        throw err;
    }
    return order;
};
