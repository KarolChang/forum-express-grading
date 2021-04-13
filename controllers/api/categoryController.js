const categoryService = require('../../services/categoryService')

const categoryController = {
  // 瀏覽類別列表
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      return res.json(data)
    })
  },
  // 新增分類
  postCategories: async (req, res) => {
    categoryService.postCategories(req, res, (data) => {
      return res.json(data)
    })
  },
  // 編輯分類
  putCategory: async (req, res) => {
    categoryService.putCategory(req, res, (data) => {
      return res.json(data)
    })
  },
  // 刪除分類
  deleteCategory: async (req, res) => {
    categoryService.deleteCategory(req, res, (data) => {
      return res.json(data)
    })
  }
}

module.exports = categoryController
