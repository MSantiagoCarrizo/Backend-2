import usersService from "../services/users.service.js";
import { UserResponseDTO } from "../dto/user-response.dto.js";

export const getUsers = async (req, res, next) => {
    try {
        const users = await usersService.getUsers();

        const usersDTO = users.map((user) => new UserResponseDTO(user));

        return res.status(200).json({ status: "success", payload: usersDTO });
    } catch (error) {
        next(error);
    }
};