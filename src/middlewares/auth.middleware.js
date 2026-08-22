import passport from "passport";

export const auth = (req, res, next) => {
    passport.authenticate(
        "current",
        { session: false },
        (error, user, info) => {
            if (error) {
                const authError = new Error("Token inválido o expirado");
                authError.statusCode = 401;
                return next(authError);
            }

            if (!user) {
                const message =
                    info?.message === "No auth token"
                        ? "No autenticado"
                        : "Token inválido o expirado";

                const authError = new Error(message);
                authError.statusCode = 401;
                return next(authError);
            }

            req.user = user;
            next();
        }
    )(req, res, next);
};

export default auth;