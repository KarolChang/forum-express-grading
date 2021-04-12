const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const adminService = {
  // 瀏覽餐廳總表
  getRestaurants: (req, res, callback) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => {
        callback({ restaurants })
      })
      .catch(err => console.log(err))
  },
  // 瀏覽一筆餐廳資料
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] })
      .then(restaurant => {
        callback({ restaurant: restaurant.toJSON() })
      })
      .catch(err => console.log(err))
  },
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
  // 刪除一筆餐廳資料(delete)
  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      restaurant.destroy()
    })
      .then(() => callback({ status: 'success', message: '' }))
      .catch(err => console.log(err))
  }
}

module.exports = adminService
