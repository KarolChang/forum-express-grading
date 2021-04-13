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
  // 新增一筆餐廳資料(post)
  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      return res.json(data)
    })
  },
  // 刪除一筆餐廳資料(delete)
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      return res.json(data)
    })
  },
  // 編輯一筆餐廳資料(put)
  putRestaurant: (req, res) => {
    adminService.putRestaurant(req, res, (data) => {
      return res.json(data)
    })
  },
  // 瀏覽使用者列表
  getUsers: (req, res) => {
    adminService.getUsers(req, res, (data) => {
      return res.json(data)
    })
  },
  // 修改使用者權限
  toggleAdmin: (req, res) => {
    adminService.toggleAdmin(req, res, (data) => {
      return res.json(data)
    })
  }
}

module.exports = adminController
