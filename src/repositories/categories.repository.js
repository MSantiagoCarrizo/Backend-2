import categoriesDAO from "../dao/categories.dao.js";

class CategoriesRepository {
    async getCategoryById(id) {
        return await categoriesDAO.getCategoryById(id);
    }

    async getCategories() {
        return await categoriesDAO.getCategories();
    }
}

export default new CategoriesRepository();