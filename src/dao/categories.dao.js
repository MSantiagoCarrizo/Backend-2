import Category from "../models/Category.js";

class CategoriesDAO {
    async getCategoryById(id) {
        return await Category.findById(id);
    }

    async getCategories() {
        return await Category.find();
    }
}

export default new CategoriesDAO();