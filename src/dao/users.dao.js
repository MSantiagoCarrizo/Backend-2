import User from "../models/User.js";

class UsersDAO {
    async getUserByEmail(email) {
        return await User.findOne({ email });
    }

    async createUser(userData) {
        return await User.create(userData);
    }

    async getUsers() {
        return await User.find().select("-password");
    }
}

export default new UsersDAO();