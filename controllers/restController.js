const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10

const restController = {
  // 瀏覽所有餐廳
  getRestaurants: async (req, res) => {
    try {
      let offset = 0
      const whereQuery = {}
      let categoryId = ''
      // 計算 offset
      if (req.query.page) {
        offset = (req.query.page - 1) * pageLimit
      }
      // 分類餐廳
      if (req.query.categoryId) {
        categoryId = Number(req.query.categoryId)
        whereQuery.CategoryId = categoryId
      }
      const result = await Restaurant.findAndCountAll({ include: Category, where: whereQuery, offset, limit: pageLimit })
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? page : page - 1
      const next = page + 1 > pages ? pages : page + 1
      const data = result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.dataValues.Category.name
      }))
      const categories = await Category.findAll({ raw: true, nest: true })
      return res.render('restaurants', { restaurants: data, categories, categoryId, page, pages, totalPage, prev, next })
    } catch (err) {
      console.warn(err)
    }
  },
  // 瀏覽單一餐廳
  getRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, {
        include: [
          Category,
          { model: Comment, include: [User] }
        ]
      })
      return res.render('restaurant', { restaurant: restaurant.toJSON() })
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = restController
