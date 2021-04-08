const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const helpers = require('../_helpers')
const defaultImg = 'https://teameowdev.files.wordpress.com/2016/04/teameow-e9a090e8a8ade9a0ade8b2bc.jpg?w=809'

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
  getUser: async (req, res) => {
    try {
      const id = Number(req.params.id)
      const userId = helpers.getUser(req).id
      const user = await User.findByPk(id)
      const comments = await Comment.findAll({ raw: true, nest: true, where: { userId: id }, include: { model: Restaurant } })
      return res.render('user', { userNow: user.toJSON(), id, userId, comments })
    } catch (err) {
      console.warn(err)
    }
  },
  // 瀏覽編輯 Profile 頁面
  editUser: async (req, res) => {
    try {
      const id = Number(req.params.id)
      const userId = helpers.getUser(req).id
      // 強制跳轉至 profile 頁面
      if (id !== userId) return res.redirect(`/users/${id}`)
      const user = await User.findByPk(userId)
      return res.render('editProfile', { user: user.toJSON() })
    } catch (err) {
      console.warn(err)
    }
  },
  // 編輯 Profile
  putUser: async (req, res) => {
    const id = Number(req.params.id)
    const userId = helpers.getUser(req).id
    // 強制跳轉至 profile 頁面
    if (userId !== id) {
      return res.redirect(`/users/${id}`)
    }
    const { file } = req
    if (file) {
      imgur.setClientID(IMGUR_CLIENT_ID)
      imgur.upload(file.path, async (err, img) => {
        try {
          if (err) console.log(err)
          const user = await User.findByPk(userId)
          await user.update({
            name: req.body.name,
            image: img.data.link
          })
          req.flash('success_msg', '個人資料編輯成功!')
          return res.redirect(`/users/${userId}`)
        } catch (err) {
          console.warn(err)
        }
      })
    } else {
      try {
        const user = await User.findByPk(userId)
        await user.update({
          name: req.body.name,
          image: defaultImg
        })
        req.flash('success_msg', '個人資料編輯成功!')
        return res.redirect(`/users/${userId}`)
      } catch (err) {
        console.warn(err)
      }
    }
  },
  // 新增至收藏
  addFavorite: async (req, res) => {
    try {
      const UserId = helpers.getUser(req).id
      const RestaurantId = req.params.restaurantId
      await Favorite.create({ UserId, RestaurantId })
      req.flash('success_msg', '此餐廳已收藏至最愛!')
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },
  // 移除出收藏
  removeFavorite: async (req, res) => {
    try {
      const UserId = helpers.getUser(req).id
      const RestaurantId = req.params.restaurantId
      const favorite = await Favorite.findOne({ where: { UserId, RestaurantId } })
      await favorite.destroy()
      req.flash('error_msg', '此餐廳已被移除最愛!')
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },
  // 新增至 Like
  addLike: async (req, res) => {
    try {
      const UserId = helpers.getUser(req).id
      const RestaurantId = req.params.restaurantId
      await Like.create({ UserId, RestaurantId })
      req.flash('success_msg', '加入Like成功!')
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },
  // 移除至 Like
  removeLike: async (req, res) => {
    try {
      const UserId = helpers.getUser(req).id
      const RestaurantId = req.params.restaurantId
      const like = await Like.findOne({ where: { UserId, RestaurantId } })
      await like.destroy()
      req.flash('error_msg', '已移除Like!')
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = userController
