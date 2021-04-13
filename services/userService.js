const db = require('../models')
const User = db.User
const Comment = db.Comment
const Restaurant = db.Restaurant
const Favorite = db.Favorite
const Like = db.Like
const Followship = db.Followship
const helpers = require('../_helpers')
const imgur = require('imgur-node-api')
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID
const defaultImg = 'https://teameowdev.files.wordpress.com/2016/04/teameow-e9a090e8a8ade9a0ade8b2bc.jpg?w=809'

const uploadImg = path => {
  return new Promise((resolve, reject) => {
    imgur.upload(path, (err, img) => {
      if (err) return reject(err)
      return resolve(img)
    })
  })
}

const userService = {
  getUser: async (req, res, callback) => {
    try {
      const id = Number(req.params.id)
      const userId = helpers.getUser(req).id
      // Promise.all()
      const [userNow, userSearch, commentsInDb] = await Promise.all(
        [
          User.findByPk(userId, {
            include: [
              { model: User, as: 'Followers' },
              { model: User, as: 'Followings' }
            ]
          }),
          User.findByPk(id, {
            include: [
              { model: Restaurant, as: 'FavoritedRestaurants' },
              { model: User, as: 'Followers' },
              { model: User, as: 'Followings' }
            ]
          }),
          Comment.findAll({
            raw: true,
            nest: true,
            where: { userId: id },
            include: { model: Restaurant }
          })
        ]
      )
      // 篩選重覆評論，列出不重複餐廳
      const comments = []
      commentsInDb.forEach(comment => {
        if (!comments.some(item => item.RestaurantId === comment.RestaurantId)) {
          comments.push(comment)
        }
      })
      const isFollowed = userNow.Followings.map(d => d.id).includes(id)
      callback({
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
  editUser: async (req, res, callback) => {
    try {
      const id = Number(req.params.id)
      const userId = helpers.getUser(req).id
      // 強制跳轉至 profile 頁面
      if (id !== userId) {
        callback({ status: 'error', id: id})
      }
      const user = await User.findByPk(userId)
      callback({ user: user.toJSON() })
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 編輯 Profile
  putUser: async (req, res, callback) => {
    try {
      const id = Number(req.params.id)
      const userId = helpers.getUser(req).id
      // 強制跳轉至 profile 頁面
      if (userId !== id) {
        callback({ status: 'error', id })
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
        callback({ status: 'success', message: '個人資料編輯成功!', userId })
      } else {
        const user = await User.findByPk(userId)
        await user.update({
          name: req.body.name,
          image: user.image ? user.image : defaultImg
        })
        // req.flash('success_msg', '個人資料編輯成功!')
        // return res.redirect(`/users/${userId}`)
        callback({ status: 'success', message: '個人資料編輯成功!', userId })
      }
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 新增至收藏
  addFavorite: async (req, res, callback) => {
    try {
      const UserId = helpers.getUser(req).id
      const RestaurantId = req.params.restaurantId
      // findOrCreate
      const [favorite, created] = await Favorite.findOrCreate({ where: { UserId, RestaurantId } })
      if (created) {
        callback({ message: '此餐廳已收藏至最愛!'})
      } else {
        callback({ message: '這個餐廳在您加入最愛之前就被加入了!可能是因為網頁未刷新~'})
      }
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 移除出收藏
  removeFavorite: async (req, res, callback) => {
    try {
      const UserId = helpers.getUser(req).id
      const RestaurantId = req.params.restaurantId
      const favorite = await Favorite.findOne({ where: { UserId, RestaurantId } })
      // 判斷這筆 Favorite 是否存在
      if (favorite) {
        await favorite.destroy()
        callback({ message: '此餐廳已被移除最愛!'})
      } else {
        callback({ message: '這個餐廳在您移除最愛之前就被移除了!可能是因為網頁未刷新~'})
      }
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 新增至 Like
  addLike: async (req, res, callback) => {
    try {
      const UserId = helpers.getUser(req).id
      const RestaurantId = req.params.restaurantId
      // findOrCreate
      const [like, created] = await Like.findOrCreate({ where: { UserId, RestaurantId } })
      if (created) {
        callback({ message: '加入Like成功!' })
      } else {
        callback({ message: 'Like在您加入之前就被加入了!可能是因為網頁未刷新~' })
      }
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 移除至 Like
  removeLike: async (req, res, callback) => {
    try {
      const UserId = helpers.getUser(req).id
      const RestaurantId = req.params.restaurantId
      const like = await Like.findOne({ where: { UserId, RestaurantId } })
      // 判斷這筆 like 是否存在
      if (like) {
        await like.destroy()
        callback({ message: '已移除Like!' })
      } else {
        callback({ message: 'Like在您移除之前就被移除了!可能是因為網頁未刷新~' })
      }
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 美食達人頁面
  getTopUser: async (req, res, callback) => {
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
      callback({ users , userId: helpers.getUser(req).id })
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 追蹤美食達人
  addFollowing: async (req, res, callback) => {
    try {
      const followingId = req.params.userId
      const followerId = helpers.getUser(req).id
      // findOrCreate
      const [followship, created] = await Followship.findOrCreate({ where: { followingId, followerId } })
      if (created) {
        callback({ message: '追蹤成功!' })
      } else {
        await Followship.create({ followingId, followerId })
        callback({ message: '在您追蹤之前就被加入追蹤名單了!可能是因為網頁未刷新~' })
      }
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 取消追蹤美食達人
  removeFollowing: async (req, res, callback) => {
    try {
      const followingId = req.params.userId
      const followerId = helpers.getUser(req).id
      const follow = await Followship.findOne({ where: { followingId, followerId } })
      if (follow) {
        await follow.destroy()
        callback({ message: '已取消追蹤!' })
      } else {
        callback({ message: '在您取消追蹤之前就被取消追蹤名單了!可能是因為網頁未刷新~' })
      }
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  }
}

module.exports = userService
