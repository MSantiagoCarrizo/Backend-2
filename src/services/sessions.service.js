import usersRepository from "../repositories/users.repository.js";
import { createHash, isValidPassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";

class SessionsService {

    async register(userData) {
        const { first_name, last_name, email, password } = userData;

        if (!first_name || !last_name || !email || !password) {
            const error = new Error("Faltan campos obligatorios");
            error.statusCode = 400;
            throw error;
        }

        const normalizedFirstName = first_name.trim();
        const normalizedLastName = last_name.trim();
        const normalizedEmail = email.trim().toLowerCase();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            const error = new Error("El formato del email no es válido");
            error.statusCode = 400;
            throw error;
        }

        if (password.length < 6) {
            const error = new Error("La contraseña debe tener al menos 6 caracteres");
            error.statusCode = 400;
            throw error;
        }

        const existingUser = await usersRepository.getUserByEmail(normalizedEmail);

        if (existingUser) {
            const error = new Error("El email ya está registrado");
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = createHash(password);

        const newUser = await usersRepository.createUser({
            first_name: normalizedFirstName,
            last_name: normalizedLastName,
            email: normalizedEmail,
            password: hashedPassword
        });

        return {
            id: newUser._id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            email: newUser.email,
            role: newUser.role
        };
    }

    async login(userData) {
        const { email, password } = userData;

        if (!email || !password) {
            const error = new Error("Email y contraseña son obligatorios");
            error.statusCode = 400;
            throw error;
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await usersRepository.getUserByEmail(normalizedEmail);

        if (!user) {
            const error = new Error("Credenciales inválidas");
            error.statusCode = 401;
            throw error;
        }

        const validPassword = isValidPassword(password, user.password);

        if (!validPassword) {
            const error = new Error("Credenciales inválidas");
            error.statusCode = 401;
            throw error;
        }

        const tokenUser = {
            id: user._id,
            email: user.email,
            role: user.role
        };

        const token = generateToken(tokenUser);

        return {
            token,
            user: tokenUser
        };
    }
}

export default new SessionsService();