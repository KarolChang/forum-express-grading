const db = require('../models')
const Restaurant = db.Restaurant

const adminController = {
  // 瀏覽餐廳總表
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true, nest: true })
      .then(restaurants => { return res.render('admin/restaurants', { restaurants }) })
  },
  // 新增一筆餐廳資料(get)
  createRestaurant: (req, res) => {
    return res.render('admin/create')
  },
  // 新增一筆餐廳資料(post)
  postRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      req.flash('error_msg', 'name是必填項目!')
      return res.redirect('back')
    }
    return Restaurant.create({ name, tel, address, opening_hours, description })
      .then(() => {
        req.flash('success_msg', '餐廳新增成功!')
        res.redirect('/admin/restaurants')
      })
  }
}

module.exports = adminController
