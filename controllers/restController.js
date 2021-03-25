// 負責處理前台餐廳相關的 request
const restController = {
  getRestaurants: (req, res) => {
    return res.render('restaurants')
  }
}

module.exports = restController
