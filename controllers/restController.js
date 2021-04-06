const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  // 瀏覽所有餐廳
  getRestaurants: async (req, res) => {
    try {
      // 瀏覽分類餐廳
      const whereQuery = {}
      let categoryId = ''
      if (req.query.categoryId) {
        categoryId = Number(req.query.categoryId)
        whereQuery.CategoryId = categoryId
      }
      const restaurants = await Restaurant.findAll({ include: Category, where: whereQuery })
      const data = restaurants.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name
      }))
      const categories = await Category.findAll({ raw: true, nest: true })
      return res.render('restaurants', { restaurants: data, categories, categoryId })
    } catch (err) {
      console.warn(err)
    }
  },
  // 瀏覽單一餐廳
  getRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, { include: Category })
      return res.render('restaurant', { restaurant: restaurant.toJSON() })
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = restController
