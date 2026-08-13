const errorhandler = (err, req, res, next) => {
    console.log(err);
    const statuscode = err.statusCode || 500;
    const message = err.message || "server error";
    res.status(statuscode).json({
        success: false,
        message: message,
    });
};

export default errorhandler;
