import usersRepository from "../repositories/users.repository.js";

class UsersService {
    async getUsers() {
        return await usersRepository.getUsers();
    }
}

export default new UsersService();