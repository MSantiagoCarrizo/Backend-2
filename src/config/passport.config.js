import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import usersRepository from "../repositories/users.repository.js";
import { createHash, isValidPassword } from "../utils/hash.js";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

passport.use(
    "register",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password",
            passReqToCallback: true
        },
        async (req, email, password, done) => {
            try {
                const { first_name, last_name } = req.body;

                if (!first_name || !last_name || !email || !password) {
                    return done(null, false, {
                        message: "Faltan campos obligatorios"
                    });
                }

                const normalizedFirstName = first_name.trim();
                const normalizedLastName = last_name.trim();
                const normalizedEmail = email.trim().toLowerCase();

                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!emailRegex.test(normalizedEmail)) {
                    return done(null, false, {
                        message: "El formato del email no es válido"
                    });
                }

                if (password.length < 6) {
                    return done(null, false, {
                        message: "La contraseña debe tener al menos 6 caracteres"
                    });
                }

                const existingUser =
                    await usersRepository.getUserByEmail(normalizedEmail);

                if (existingUser) {
                    return done(null, false, {
                        message: "El email ya está registrado"
                    });
                }

                const hashedPassword = createHash(password);

                const newUser = await usersRepository.createUser({
                    first_name: normalizedFirstName,
                    last_name: normalizedLastName,
                    email: normalizedEmail,
                    password: hashedPassword
                });

                return done(null, newUser);
            } catch (error) {
                return done(error);
            }
        }
    )
);


passport.use(
    "login",
    new LocalStrategy(
        {
            usernameField: "email",
            passwordField: "password"
        },
        async (email, password, done) => {
            try {
                if (!email || !password) {
                    return done(null, false, {
                        message: "Email y contraseña son obligatorios"
                    });
                }

                const normalizedEmail = email.trim().toLowerCase();

                const user = await usersRepository.getUserByEmail(
                    normalizedEmail
                );

                if (!user) {
                    return done(null, false, {
                        message: "Credenciales inválidas"
                    });
                }

                const validPassword = isValidPassword(
                    password,
                    user.password
                );

                if (!validPassword) {
                    return done(null, false, {
                        message: "Credenciales inválidas"
                    });
                }

                return done(null, user);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.use(
    "current",
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => req.cookies.currentUser
            ]),
            secretOrKey: process.env.JWT_SECRET
        },
        async (payload, done) => {
            try {
                return done(null, payload);
            } catch (error) {
                return done(error);
            }
        }
    )
);

export default passport;