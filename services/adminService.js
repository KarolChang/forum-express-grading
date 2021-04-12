const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
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
  },
  // 瀏覽一筆餐廳資料
  getRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id, { include: [Category] })
      .then(restaurant => {
        callback({ restaurant: restaurant.toJSON() })
      })
      .catch(err => console.log(err))
  },
  // 新增一筆餐廳資料(post)
  postRestaurant: async (req, res, callback) => {
    try {
      const { name, tel, address, opening_hours, description } = req.body
      if (!name) {
        return callback({ status: 'error', message: 'name是必填項目!' })
      }
      const { file } = req
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        const img = await uploadImg(file.path)
        await Restaurant.create({ name, tel, address, opening_hours, description, image: img.data.link, CategoryId: req.body.categoryId })
        return callback({ status: 'success', message: '餐廳新增成功!' })
      } else {
        await Restaurant.create({ name, tel, address, opening_hours, description, image: defaultImg, CategoryId: req.body.categoryId })
        return callback({ status: 'success', message: '餐廳新增成功!' })
      }
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 編輯一筆餐廳資料(put)
  putRestaurant: async (req, res, callback) => {
    try {
      const { name, tel, address, opening_hours, description } = req.body
      if (!name) {
        callback({ status: 'error', message: 'name是必填項目!'})
      }
      const { file } = req
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        const img = await uploadImg(file.path)
        const restaurant = await Restaurant.findByPk(req.params.id)
        await restaurant.update({ name, tel, address, opening_hours, description, image: img.data.link, CategoryId: req.body.categoryId })
        callback({ status: 'success', message: '餐廳編輯成功!'})
      } else {
        const restaurant = await Restaurant.findByPk(req.params.id)
        await restaurant.update({ name, tel, address, opening_hours, description, image: restaurant.image, CategoryId: req.body.categoryId })
        callback({ status: 'success', message: '餐廳編輯成功!'})
      }
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 刪除一筆餐廳資料(delete)
  deleteRestaurant: (req, res, callback) => {
    return Restaurant.findByPk(req.params.id).then(restaurant => {
      restaurant.destroy()
    })
      .then(() => callback({ status: 'success', message: '餐廳已刪除!' }))
      .catch(err => console.log(err))
  },
  // 瀏覽類別列表
  getCategories: async (req, res, callback) => {
    try {
      const categories = await Category.findAll({ raw: true, nest: true })
      if (req.params.id) {
        const category = await Category.findByPk(req.params.id)
        callback({ category: category.toJSON(), categories })
      }
      callback({ categories })
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 新增分類
  postCategories: async (req, res, callback) => {
    try {
      const name = req.body.name.trim()
      if (!name) {
        callback({ status: 'error', message: '請輸入非空白字串!' })
      } else {
        await Category.create({ name })
        callback({ status: 'success', message: `成功新增 "${name}" 類別` })
      }
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 編輯分類
  putCategory: async (req, res, callback) => {
    try {
      const name = req.body.name.trim()
      if (!name) {
        callback({ status: 'error', message: '請輸入非空白字串!'})
      }
      const category = await Category.findByPk(req.params.id)
      await category.update(req.body)
      callback({ status: 'success', message: `成功修改 "${name}" 類別`})
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 刪除分類
  deleteCategory: async (req, res, callback) => {
    try {
      const category = await Category.findByPk(req.params.id)
      if (category) {
        await category.destroy()
        callback({ status: 'success', message: '分類已刪除!'})
      }
      callback({ status: 'error', message: '分類不存在!'})
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  }
}

module.exports = adminService
