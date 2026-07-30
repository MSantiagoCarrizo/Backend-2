import User from "../models/User.js";

class UsersDAO {
    async getUserByEmail(email) {
        return await User.findOne({ email });
    }

    async createUser(userData) {
        return await User.create(userData);
    }
}

export default new UsersDAO();