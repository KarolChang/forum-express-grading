const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
// const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID

const adminController = {
  // 瀏覽餐廳總表
  getRestaurants: (req, res) => {
    return Restaurant.findAll({ raw: true, nest: true, include: [Category] })
      .then(restaurants => {
        return res.render('admin/restaurants', { restaurants })
      })
      .catch(err => console.log(err))
  },
  // 新增一筆餐廳資料(get)
  createRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true }).then(categories => {
      return res.render('admin/create', { categories })
    })
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
        if (err) console.log(err)
        return Restaurant.create({ name, tel, address, opening_hours, description, image: file ? img.data.link : null, CategoryId: req.body.categoryId })
          .then(() => {
            req.flash('success_messages', 'restaurant was successfully created')
            return res.redirect('/admin/restaurants')
          })
          .catch(err => console.log(err))
      })
    } else {
      return Restaurant.create({ name, tel, address, opening_hours, description, image: null, CategoryId: req.body.categoryId })
        .then(() => {
          req.flash('success_messages', 'restaurant was successfully created')
          return res.redirect('/admin/restaurants')
        })
        .catch(err => console.log(err))
    }
  },
  // 瀏覽一筆餐廳資料
  getRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] }).then(restaurant => {
      return res.render('admin/restaurant', { restaurant: restaurant.toJSON() })
    })
      .catch(err => console.log(err))
  },
  // 編輯一筆餐廳資料(get)
  editRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true })
      .then(categories => {
        return Restaurant.findByPk(req.params.id, { raw: true })
          .then(restaurant => {
            return res.render('admin/create', { restaurant, categories })
          })
      })
      .catch(err => console.log(err))
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
        if (err) console.log(err)
        return Restaurant.findByPk(req.params.id).then(restaurant => {
          restaurant.update({ name, tel, address, opening_hours, description, image: file ? img.data.link : restaurant.image, CategoryId: req.body.categoryId })
        })
          .then(() => {
            req.flash('success_msg', '餐廳編輯成功!')
            res.redirect('/admin/restaurants')
          })
          .catch(err => console.log(err))
      })
    } else {
      return Restaurant.findByPk(req.params.id).then(restaurant => {
        restaurant.update({ name, tel, address, opening_hours, description, image: restaurant.image, CategoryId: req.body.categoryId })
          .then(() => {
            req.flash('success_msg', '餐廳編輯成功!')
            return res.redirect('/admin/restaurants')
          })
          .catch(err => console.log(err))
      })
    }
  },
  // 刪除一筆餐廳資料(delete)
  deleteRestaurant: (req, res) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      restaurant.destroy()
    })
      .then(() => res.redirect('/admin/restaurants'))
      .catch(err => console.log(err))
  },
  // 瀏覽使用者列表
  getUsers: (req, res) => {
    return User.findAll({ raw: true })
      .then(users => {
        return res.render('admin/users', { users })
      })
      .catch(err => console.log(err))
  },
  // 修改使用者權限
  toggleAdmin: (req, res, next) => {
    return User.findByPk(req.params.id).then(user => {
      if (user.isAdmin) {
        user.isAdmin = false
      } else {
        user.isAdmin = true
      }
      return user.save()
    })
      .then(user => {
        const authority = user.isAdmin ? 'admin' : 'user'
        req.flash('success_msg', `${user.name}已成功修改權限至: ${authority}!`)
        return res.redirect('/admin/users')
      })
      .catch(err => console.log(err))
  }
}

module.exports = adminController
