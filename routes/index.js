const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')

module.exports = app => {
  // 前台
  app.get('/', (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants', restController.getRestaurants)
  // 後台
  app.get('/', (req, res) => res.redirect('/admin/restaurants'))
  app.get('/admin/restaurants', adminController.getRestaurants)
}
