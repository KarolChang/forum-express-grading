const db = require('../models')
const Category = db.Category

const categoryService = {
  // 瀏覽類別列表
  getCategories: async (req, res, callback) => {
    try {
      const categories = await Category.findAll({ raw: true, nest: true })
      if (req.params.id) {
        const category = await Category.findByPk(req.params.id)
        callback({ category: category.toJSON(), categories })
      }
      callback({ categories })
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 新增分類
  postCategories: async (req, res, callback) => {
    try {
      const name = req.body.name.trim()
      if (!name) {
        callback({ status: 'error', message: '請輸入非空白字串!' })
      } else {
        await Category.create({ name })
        callback({ status: 'success', message: `成功新增 "${name}" 類別` })
      }
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 編輯分類
  putCategory: async (req, res, callback) => {
    try {
      const name = req.body.name.trim()
      if (!name) {
        callback({ status: 'error', message: '請輸入非空白字串!'})
      }
      const category = await Category.findByPk(req.params.id)
      await category.update(req.body)
      callback({ status: 'success', message: `成功修改 "${name}" 類別`})
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 刪除分類
  deleteCategory: async (req, res, callback) => {
    try {
      const category = await Category.findByPk(req.params.id)
      if (category) {
        await category.destroy()
        callback({ status: 'success', message: '分類已刪除!'})
      }
      callback({ status: 'error', message: '分類不存在!'})
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  }
}

module.exports = categoryService
