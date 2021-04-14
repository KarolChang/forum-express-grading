const restService = require('../../services/restService')

const restController = {
  // 瀏覽所有餐廳
  getRestaurants: (req, res) => {
    restService.getRestaurants(req, res, (data) => {
      return res.json(data)
    })
  },
  // 瀏覽單一餐廳
  getRestaurant: (req, res) => {
    restService.getRestaurant(req, res, (data) => {
      return res.json(data)
    })
  },
  // 瀏覽餐廳 dashboard
  getDashboard: (req, res) => {
    restService.getDashboard(req, res, (data) => {
      return res.json(data)
    })
  },
  // 增加 最新動態 (餐廳 & 評論)
  getFeeds: (req, res) => {
    restService.getFeeds(req, res, (data) => {
      return res.json(data)
    })
  },
  // 人氣餐廳頁面
  getTopRestaurant: (req, res) => {
    restService.getTopRestaurant(req, res, (data) => {
      return res.json(data)
    })
  }
}

module.exports = restController
