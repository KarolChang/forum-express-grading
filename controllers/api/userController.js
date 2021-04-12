const db = require('../../models')
const User = db.User

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const passportJWT = require('passport-jwt')
const ExtractJWT = passportJWT.ExtractJWT
const JwtStrategy = passportJWT.Strategy

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
  }
}

module.exports = userController
