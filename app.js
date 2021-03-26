const express = require('express')
const exphbs = require('express-handlebars')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')

const db = require('./models')
const app = express()
const port = 3000

app.engine('hbs', exphbs({ extname: '.hbs'}))
app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({ secret: 'MySecret', resave: false, saveUninitialized: false }))
app.use(flash())
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  next()
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

require('./routes')(app)

module.exports = app
