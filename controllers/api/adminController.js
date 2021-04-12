const db = require('../../models')
const Restaurant = db.Restaurant
const Category = db.Category

const adminController = {
  // 瀏覽餐廳總表
  getRestaurants: (req, res) => {
    return Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => {
        return res.json({ restaurants })
      })
      .catch(err => console.log(err))
  }
}

module.exports = adminController
