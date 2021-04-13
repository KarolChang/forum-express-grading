const db = require('../../models')
const User = db.User

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJWT = passportJWT.ExtractJWT
const JwtStrategy = passportJWT.Strategy

const userService = require('../../services/userService')

const userController = {
  signIn: async (req, res) => {
    try {
      // check required datas
      if (!req.body.email || !req.body.password) {
        return res.json({ status: 'error', message: '信箱和密碼是必填項目!' })
      }
      // check user exists & password correct or not
      const userEmail = req.body.email
      const userPassword = req.body.password
      const user = await User.findOne({ where: { email: userEmail }})
      if (!user) return res.status(401).json({ status: 'error', message: '此信箱未被註冊過!' })
      if (!bcrypt.compareSync(userPassword, user.password)) {
        return res.status(401).json({ status: 'error', message: '密碼不正確!' })
      }
      // get token
      const payload = { id: user.id }
      const token = jwt.sign(payload, process.env.JWT_SECRET)
      const { id, name, email, password } = user
      return res.json({
        status: 'success',
        message: 'ok',
        token: token,
        user: { id, name, email, password }
      })
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  signUp: async (req, res) => {
    try {
      if (req.body.passwordCheck !== req.body.password) {
        return res.json({ status: 'error', message: '密碼與確認密碼不相符!' })
      } else {
        const user = await User.findOne({ where: { email: req.body.email } })
        if (user) {
          return res.json({ status: 'error', message: '此信箱已被註冊!' })
        }
        User.create({
          name: req.body.name,
          email: req.body.email,
          password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10), null)
        })
        return res.json({ status: 'success', message: '註冊成功!' })
      }
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 瀏覽 Profile
  getUser: (req, res) => {
    userService.getUser(req, res, (data) => {
      return res.json(data)
    })
  },
  // 瀏覽編輯 Profile 頁面
  editUser: (req, res) => {
    userService.editUser(req, res, (data) => {
      return res.json(data)
    })
  },
  // 編輯 Profile
  putUser: (req, res) => {
    userService.putUser(req, res, (data) => {
      return res.json(data)
    })
  },
  // 新增至收藏
  addFavorite: (req, res) => {
    userService.addFavorite(req, res, (data) => {
      return res.json(data)
    })
  },
  // 移除出收藏
  removeFavorite: (req, res) => {
    userService.removeFavorite(req, res, (data) => {
      return res.json(data)
    })
  },
  // 新增至 Like
  addLike: (req, res) => {
    userService.addLike(req, res, (data) => {
      return res.json(data)
    })
  },
  // 移除至 Like
  removeLike: (req, res) => {
    userService.removeLike(req, res, (data) => {
      return res.json(data)
    })
  },
  // 美食達人頁面
  getTopUser: (req, res) => {
    userService.getTopUser(req, res, (data) => {
      return res.json(data)
    })
  },
  // 追蹤美食達人
  addFollowing: (req, res) => {
    userService.addFollowing(req, res, (data) => {
      return res.json(data)
    })
  },
  // 取消追蹤美食達人
  removeFollowing: (req, res) => {
    userService.removeFollowing(req, res, (data) => {
      return res.json(data)
    })
  }
}

module.exports = userController
