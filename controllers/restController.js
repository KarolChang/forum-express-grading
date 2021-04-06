const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category

const restController = {
  getRestaurants: async (req, res) => {
    try {
      const restaurants = await Restaurant.findAll({ include: Category })
      console.log('restaurants[0]', restaurants[0])
      const data = restaurants.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.Category.name
      }))
      return res.render('restaurants', { restaurants: data })
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = restController
