const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helpers = require('../_helpers')
const defaultImg = 'https://teameowdev.files.wordpress.com/2016/04/teameow-e9a090e8a8ade9a0ade8b2bc.jpg?w=809'
const sequelize = require('sequelize')

const userService = require('../services/userService')

const uploadImg = path => {
  return new Promise((resolve, reject) => {
    imgur.upload(path, (err, img) => {
      if (err) return reject(err)
      return resolve(img)
    })
  })
}

const userController = {
  // signup page
  signUpPage: (req, res) => {
    return res.render('signup')
  },
  // signup feature
  signUp: (req, res) => {
    const { name, email, password, passwordCheck } = req.body
    if (password !== passwordCheck) {
      req.flash('error_msg', '密碼與確認密碼不相符!')
      return res.redirect('/signup')
      // return res.render('signup', { name, email, password, passwordCheck })
    } else {
      User.findOne({ where: { email } })
        .then(user => {
          if (user) {
            req.flash('error_msg', '這個信箱已經被註冊過!')
            return res.redirect('/signup')
          } else {
            User.create({
              name,
              email,
              password: bcrypt.hashSync(password, bcrypt.genSaltSync(10), null)
            })
              .then(() => {
                req.flash('success_msg', '註冊成功!')
                return res.redirect('/signin')
              })
          }
        })
    }
  },
  // signIn page
  signInPage: (req, res) => {
    return res.render('signin')
  },
  // signIn feature
  signIn: (req, res) => {
    req.flash('success_msg', '成功登入!')
    return res.redirect('/restaurants')
  },
  // logout
  logout: (req, res) => {
    req.flash('success_msg', '成功登出!')
    req.logout()
    res.redirect('/signin')
  },
  // 瀏覽 Profile
  getUser: (req, res) => {
    userService.getUser(req, res, (data) => {
      return res.render('user', data)
    })
  },
  // 瀏覽編輯 Profile 頁面
  editUser: (req, res) => {
    userService.editUser(req, res, (data) => {
      if (data.status === 'error') {
        return res.redirect(`/users/${data.id}`)
      }
      return res.render('editProfile', data)
    })
  },
  // 編輯 Profile
  putUser: (req, res) => {
    userService.putUser(req, res, (data) => {
      if (data.status === 'error') {
        return res.redirect(`/users/${data.id}`)
      }
      req.flash('success_msg', data.message)
      return res.redirect(`/users/${data.userId}`)
    })
  },
  // 新增至收藏
  addFavorite: (req, res) => {
    userService.addFavorite(req, res, (data) => {
      req.flash('success_msg', data.message)
      return res.redirect('back')
    })
  },
  // 移除出收藏
  removeFavorite: (req, res) => {
    userService.removeFavorite(req, res, (data) => {
      req.flash('success_msg', data.message)
      return res.redirect('back')
    })
  },
  // 新增至 Like
  addLike: (req, res) => {
    userService.addLike(req, res, (data) => {
      req.flash('success_msg', data.message)
      return res.redirect('back')
    })
  },
  // 移除至 Like
  removeLike: (req, res) => {
    userService.removeLike(req, res, (data) => {
      req.flash('success_msg', data.message)
      return res.redirect('back')
    })
  },
  // 美食達人頁面
  getTopUser: (req, res) => {
    userService.getTopUser(req, res, (data) => {
      return res.render('topUser', data)
    })
  },
  // 追蹤美食達人
  addFollowing: (req, res) => {
    userService.addFollowing(req, res, (data) => {
      req.flash('success_msg', data.message)
      return res.redirect('back')
    })
  },
  // 取消追蹤美食達人
  removeFollowing: (req, res) => {
    userService.removeFollowing(req, res, (data) => {
      req.flash('success_msg', data.message)
      return res.redirect('back')
    })
  },
  // 人氣餐廳頁面
  getTopRestaurant: async (req, res, next) => {
    try {
      const topNumber = 10
      const UserId = helpers.getUser(req).id
      let restaurants = await Restaurant.findAll({
        include: { model: User, as: 'FavoritedUsers' },
        attributes: {
          include: [
            [
              sequelize.literal('(SELECT COUNT(*) FROM Favorites WHERE Favorites.RestaurantId = Restaurant.id GROUP BY favorites.RestaurantId)'), 'favoriteCount'
            ]
          ]
        },
        order: [[sequelize.literal('favoriteCount'), 'DESC']],
        limit: 10
      })
      restaurants = restaurants.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 20),
        favoriteCount: r.FavoritedUsers.length,
        isFavorited: r.FavoritedUsers.map(d => d.id).includes(UserId)
      }))
      restaurants = restaurants.sort((a, b) => b.favoriteCount - a.favoriteCount)
      restaurants = restaurants.slice(0, topNumber)
      return res.render('topRestaurant', { restaurants })
    } catch (err) {
      next(err)
    }
  }
}

module.exports = userController
