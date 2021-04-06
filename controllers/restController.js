const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  // 瀏覽所有餐廳
  getRestaurants: async (req, res) => {
    try {
      const restaurants = await Restaurant.findAll({ include: Category })
      const data = restaurants.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name
      }))
      return res.render('restaurants', { restaurants: data })
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
