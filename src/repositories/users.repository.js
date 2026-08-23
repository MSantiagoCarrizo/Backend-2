import usersDAO from "../dao/users.dao.js";

class UsersRepository {
    async getUserByEmail(email) {
        return await usersDAO.getUserByEmail(email);
    }

    async createUser(userData) {
        return await usersDAO.createUser(userData);
    }

    async getUsers() {
        return await usersDAO.getUsers();
    }
}

export default new UsersRepository();