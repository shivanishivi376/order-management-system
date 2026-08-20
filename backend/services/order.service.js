import Order from "../models/order.model.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildOrderQuery = (baseQuery, queryOptions = {}) => {
    const { status, productName, fromDate, toDate, minPrice, maxPrice } = queryOptions;
    const query = { ...baseQuery };

    if (status) query.status = status;
    if (productName?.trim()) {
        query.productName = { $regex: escapeRegex(productName.trim()), $options: "i" };
    }

    if (fromDate || toDate) {
        query.createdAt = {};
        if (fromDate) query.createdAt.$gte = new Date(`${fromDate}T00:00:00.000Z`);
        if (toDate) {
            const nextDay = new Date(`${toDate}T00:00:00.000Z`);
            nextDay.setUTCDate(nextDay.getUTCDate() + 1);
            // $lt next day includes every order made on the selected end date.
            query.createdAt.$lt = nextDay;
        }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        query.price = {};
        if (minPrice !== undefined && minPrice !== "") query.price.$gte = Number(minPrice);
        if (maxPrice !== undefined && maxPrice !== "") query.price.$lte = Number(maxPrice);
    }

    return query;
};

const getPagination = (queryOptions = {}) => {
    const page = Math.max(1, Number.parseInt(queryOptions.page, 10) || 1);
    const limit = Math.max(1, Number.parseInt(queryOptions.limit, 10) || 10);
    return { page, limit, skip: (page - 1) * limit };
};

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
    const query = buildOrderQuery({ userId }, queryOptions);
    const { page, limit, skip } = getPagination(queryOptions);

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
    const query = buildOrderQuery({}, queryOptions);
    const { page, limit, skip } = getPagination(queryOptions);

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
