const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

const userController = {
  signUpPage: (req, res) => {
    return res.render('signup')
  },
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
  }
}

module.exports = userController
