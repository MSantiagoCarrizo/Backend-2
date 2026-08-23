export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            const authError = new Error("No autenticado");
            authError.statusCode = 401;
            return next(authError);
        }

        if (!allowedRoles.includes(req.user.role)) {
            const authError = new Error(
                "No tenés permisos para realizar esta acción"
            );
            authError.statusCode = 403;
            return next(authError);
        }

        next();
    };
};

export default authorizeRoles;