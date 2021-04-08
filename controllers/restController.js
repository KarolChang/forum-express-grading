const db = require('../models')
const Restaurant = db.Restaurant
const Category = db.Category
const Comment = db.Comment
const User = db.User
const pageLimit = 10
const helpers = require('../_helpers')

const restController = {
  // 瀏覽所有餐廳
  getRestaurants: async (req, res) => {
    try {
      let offset = 0
      const whereQuery = {}
      let categoryId = ''
      // 計算 offset
      if (req.query.page) {
        offset = (req.query.page - 1) * pageLimit
      }
      // 分類餐廳
      if (req.query.categoryId) {
        categoryId = Number(req.query.categoryId)
        whereQuery.CategoryId = categoryId
      }
      const result = await Restaurant.findAndCountAll({ include: Category, where: whereQuery, offset, limit: pageLimit })
      const page = Number(req.query.page) || 1
      const pages = Math.ceil(result.count / pageLimit)
      const totalPage = Array.from({ length: pages }).map((item, index) => index + 1)
      const prev = page - 1 < 1 ? page : page - 1
      const next = page + 1 > pages ? pages : page + 1
      const data = await result.rows.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 50),
        categoryName: r.dataValues.Category.name,
        isFavorited: req.user.FavoritedRestaurants.map(d => d.id).includes(r.id),
        isLiked: req.user.LikedRestaurants.map(d => d.id).includes(r.id)
      }))
      const categories = await Category.findAll({ raw: true, nest: true })
      return res.render('restaurants', { restaurants: data, categories, categoryId, page, pages, totalPage, prev, next })
    } catch (err) {
      console.warn(err)
    }
  },
  // 瀏覽單一餐廳
  getRestaurant: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, {
        include: [
          Category,
          { model: Comment, include: [User] },
          { model: User, as: 'FavoritedUsers' },
          { model: User, as: 'LikedUsers' }
        ]
      })
      const isFavorited = restaurant.FavoritedUsers.map(d => d.id).includes(helpers.getUser(req).id)
      const isLiked = restaurant.LikedUsers.map(d => d.id).includes(helpers.getUser(req).id)
      restaurant.viewCounts += 1
      await restaurant.save()
      return res.render('restaurant', { restaurant: restaurant.toJSON(), isFavorited, isLiked })
    } catch (err) {
      console.warn(err)
    }
  },
  // 增加 最新動態 (餐廳 & 評論)
  getFeeds: (req, res) => {
    return Promise.all([
      Restaurant.findAll({
        raw: true,
        nest: true,
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category]
      }),
      Comment.findAll({
        raw: true,
        nest: true,
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant]
      })
    ]).then(([restaurants, comments]) => {
      return res.render('feeds', { restaurants, comments })
    })
      .catch(err => console.log(err))
  },
  // 瀏覽餐廳 dashboard
  getDashboard: async (req, res) => {
    try {
      const restaurant = await Restaurant.findByPk(req.params.id, { include: [Category, Comment] })
      return res.render('dashboard', { restaurant: restaurant.toJSON() })
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = restController
