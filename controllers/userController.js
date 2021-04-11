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
  getUser: async (req, res) => {
    try {
      const id = Number(req.params.id)
      const userId = helpers.getUser(req).id
      const userNow = await User.findByPk(userId, {
        include: [
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' }
        ]
      })
      const userSearch = await User.findByPk(id, {
        include: [
          { model: Restaurant, as: 'FavoritedRestaurants' },
          { model: User, as: 'Followers' },
          { model: User, as: 'Followings' }
        ]
      })
      const isFollowed = userNow.Followings.map(d => d.id).includes(id)
      const commentsInDb = await Comment.findAll({
        raw: true,
        nest: true,
        where: { userId: id },
        include: { model: Restaurant }
      })
      // 篩選重覆評論，列出不重複餐廳
      const comments = []
      commentsInDb.forEach(comment => {
        if (!comments.some(item => item.RestaurantId === comment.RestaurantId)) {
          comments.push(comment)
        }
      })
      return res.render('user', {
        userNow: userNow.toJSON(),
        userSearch: userSearch.toJSON(),
        comments,
        isFollowed
      })
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
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
    try {
      const id = Number(req.params.id)
      const userId = helpers.getUser(req).id
      // 強制跳轉至 profile 頁面
      if (userId !== id) {
        return res.redirect(`/users/${id}`)
      }
      const { file } = req
      if (file) {
        imgur.setClientID(IMGUR_CLIENT_ID)
        const img = await uploadImg(file.path)
        const user = await User.findByPk(userId)
        await user.update({
          name: req.body.name,
          image: img.data.link
        })
        req.flash('success_msg', '個人資料編輯成功!')
        return res.redirect(`/users/${userId}`)
      } else {
        const user = await User.findByPk(userId)
        await user.update({
          name: req.body.name,
          image: defaultImg
        })
        req.flash('success_msg', '個人資料編輯成功!')
        return res.redirect(`/users/${userId}`)
      }
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
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
      return res.render('error', { err })
    }
  },
  // 移除出收藏
  removeFavorite: async (req, res) => {
    try {
      const UserId = helpers.getUser(req).id
      const RestaurantId = req.params.restaurantId
      const favorite = await Favorite.findOne({ where: { UserId, RestaurantId } })
      await favorite.destroy()
      req.flash('success_msg', '此餐廳已被移除最愛!')
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
      req.flash('success_msg', '已移除Like!')
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },
  // 美食達人頁面
  getTopUser: async (req, res) => {
    try {
      let users = await User.findAll({
        include: [
          { model: User, as: 'Followers' }
        ]
      })
      users = users.map(user => ({
        ...user.dataValues,
        FollowerCount: user.Followers.length,
        isFollowed: req.user.Followings.map(d => d.id).includes(user.id)
      }))
      users = users.sort((a, b) => b.FollowerCount - a.FollowerCount)
      return res.render('topUser', { users, userId: helpers.getUser(req).id })
    } catch (err) {
      console.warn(err)
    }
  },
  // 追蹤美食達人
  addFollowing: async (req, res) => {
    try {
      const followingId = req.params.userId
      const followerId = helpers.getUser(req).id
      await Followship.create({ followingId, followerId })
      req.flash('success_msg', '已追蹤!')
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },
  // 取消追蹤美食達人
  removeFollowing: async (req, res) => {
    try {
      const followingId = req.params.userId
      const followerId = helpers.getUser(req).id
      const follow = await Followship.findOne({ where: { followingId, followerId } })
      await follow.destroy()
      req.flash('success_msg', '已取消追蹤!')
      return res.redirect('back')
    } catch (err) {
      console.warn(err)
    }
  },
  // 人氣餐廳頁面
  getTopRestaurant: async (req, res, next) => {
    try {
      const topNumber = 10
      const UserId = helpers.getUser(req).id
      const user = await User.findByPk(UserId, {
        include: [
          { model: Restaurant, as: 'FavoritedRestaurants' }
        ]
      })
      let restaurants = await Restaurant.findAll({
        include: [
          { model: User, as: 'FavoritedUsers' }
        ]
      })
      restaurants = restaurants.map(r => ({
        ...r.dataValues,
        description: r.dataValues.description.substring(0, 20),
        favoriteCount: r.FavoritedUsers.length,
        isFavorited: user.FavoritedRestaurants.map(d => d.id).includes(r.id)
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
