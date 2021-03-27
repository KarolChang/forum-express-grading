const db = require('../models')
const Restaurant = db.Restaurant
const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

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
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.create({ name, tel, address, opening_hours, description, image: file ? img.data.link : null })
          .then(() => {
            req.flash('success_messages', 'restaurant was successfully created')
            return res.redirect('/admin/restaurants')
          })
      })
    } else {
      return Restaurant.create({ name, tel, address, opening_hours, description, image: null })
        .then(() => {
          req.flash('success_messages', 'restaurant was successfully created')
          return res.redirect('/admin/restaurants')
        })
    }
  },
  // 瀏覽一筆餐廳資料
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      return res.render('admin/restaurant', { restaurant: restaurant.toJSON() })
    })
  },
  // 編輯一筆餐廳資料(get)
  editRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { raw: true }).then(restaurant => {
      return res.render('admin/create', { restaurant })
    })
  },
  // 編輯一筆餐廳資料(put)
  putRestaurant: (req, res) => {
    const { name, tel, address, opening_hours, description } = req.body
    if (!name) {
      req.flash('error_msg', 'name是必填項目!')
      return res.redirect('back')
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, (err, img) => {
        return Restaurant.findByPk(req.params.id).then(restaurant => {
          restaurant.update({ name, tel, address, opening_hours, description, image: file ? img.data.link : restaurant.image })
        })
          .then(() => {
            req.flash('success_msg', '餐廳編輯成功!')
            res.redirect('/admin/restaurants')
          })
      })
    } else {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        restaurant.update({ name, tel, address, opening_hours, description, image: restaurant.image })
          .then(() => {
            req.flash('success_msg', '餐廳編輯成功!')
            return res.redirect('/admin/restaurants')
          })
      })
    }
  },
  // 刪除一筆餐廳資料(delete)
  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      restaurant.destroy()
    })
      .then(() => res.redirect('/admin/restaurants'))
  }
}

module.exports = adminController
