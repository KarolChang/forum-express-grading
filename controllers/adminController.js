const db = require('../models')
const Restaurant = db.Restaurant
const User = db.User
const Category = db.Category
// const fs = require('fs')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const defaultImg = 'https://www.phoca.cz/images/projects/phoca-restaurant-menu-r.png'

const uploadImg = path => {
  return new Promise((resolve, reject) => {
    imgur.upload(path, (err, img) => {
      if (err) return reject(err)
      return resolve(img)
    })
  })
}

const adminService = require('../services/adminService')
const categoryService = require('../services/categoryService')

const adminController = {
  // 瀏覽餐廳總表
  getRestaurants: (req, res) => {
    adminService.getRestaurants(req, res, (data) => {
      return res.render('admin/restaurants', data)
    })
  },
  // 新增一筆餐廳資料(get)
  createRestaurant: (req, res) => {
    Category.findAll({ raw: true, nest: true }).then(categories => {
      return res.render('admin/create', { categories })
    })
  },
  // 新增一筆餐廳資料(post)
  postRestaurant: (req, res) => {
    adminService.postRestaurant(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_msg', data.message)
        return res.redirect('back')
      }
      req.flash('success_msg', data.message)
      return res.redirect('/admin/restaurants')
    })
  },
  // 瀏覽一筆餐廳資料
  getRestaurant: (req, res) => {
    adminService.getRestaurant(req, res, (data) => {
      return res.render('admin/restaurant', data)
    })
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
  putRestaurant: async (req, res) => {
    adminService.putRestaurant(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_msg', data.message)
        return res.redirect('back')
      }
      req.flash('success_msg', data.message)
      return res.redirect('/admin/restaurants')
    })
  },
  // 刪除一筆餐廳資料(delete)
  deleteRestaurant: (req, res) => {
    adminService.deleteRestaurant(req, res, (data) => {
      if (data.status === 'success') {
        req.flash('success_msg', data.message)
        return res.redirect('/admin/restaurants')
      }
    })
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
  toggleAdmin: (req, res) => {
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
  },
  // 瀏覽類別列表
  getCategories: (req, res) => {
    categoryService.getCategories(req, res, (data) => {
      return res.render('admin/categories', data)
    })
  },
  // 新增分類
  postCategories: async (req, res) => {
    categoryService.postCategories(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_msg', data.message)
        return res.redirect('back')
      }
      req.flash('success_msg', data.message)
      return res.redirect('/admin/categories')
    })
  },
  // 編輯分類
  putCategory: async (req, res) => {
    categoryService.putCategory(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_msg', data.message)
        return res.redirect('back')
      }
      req.flash('success_msg', data.message)
      return res.redirect('/admin/categories')
    })
  },
  // 刪除分類
  deleteCategory: async (req, res) => {
    categoryService.deleteCategory(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_msg', data.message)
        return res.redirect('back')
      }
      req.flash('success_msg', data.message)
      return res.redirect('/admin/categories')
    })
  }
}

module.exports = adminController
