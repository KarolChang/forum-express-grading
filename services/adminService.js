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
  }
}

module.exports = adminService
