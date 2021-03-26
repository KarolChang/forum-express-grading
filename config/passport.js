const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, cb) => {
  User.findOne({ where: { email } })
    .then(user => {
      if (!user) return cb(null, false, req.flash('error_msg', '信箱或密碼不正確!'))
      if (!bcrypt.compareSync(password, user.password)) return cb(null, false, req.flash('error_msg', '信箱或密碼不正確!'))
      return cb(null, user)
    })
}))

passport.serializeUser((user, cb) => {
  return cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
  User.findByPk(id).then(user => { return cb(null, user) })
})

module.exports = passport
