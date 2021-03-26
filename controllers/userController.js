const bcrypt = require('bcryptjs')
const passport = require('passport')
const db = require('../models')
const User = db.User

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
  }
}

module.exports = userController
