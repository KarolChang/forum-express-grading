const adminService = require('../../services/adminService')

const adminController = {
  // 瀏覽餐廳總表
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.json(data)
    })
  },
  // 瀏覽一筆餐廳資料
  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.json(data)
    })
  },
  // 瀏覽類別列表
  getCategories: (req, res) => {
    adminService.getCategories(req, res, (data) => {
      return res.json(data)
    })
  },
 // 刪除一筆餐廳資料(delete)
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      return res.json(data)
    })
  }
}

module.exports = adminController
