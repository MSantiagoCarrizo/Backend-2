const errorHandler = (error, req, res, next) => {
    return res.status(error.statusCode || 500).json({
        status: "error",
        message: error.message || "Error interno del servidor"
    });
};

export default errorHandler;