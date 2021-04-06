const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const commentController = require('../controllers/commentController')

const multer = require('multer')
const upload = multer({ dest: 'temp/' })

const helpers = require('../_helpers')

module.exports = (app, passport) => {
  // 身分驗證
  const authenticated = (req, res, next) => {
    if (helpers.ensureAuthenticated(req)) return next()
    return res.redirect('/signin')
  }
  const authenticatedAdmin = (req, res, next) => {
    if (helpers.ensureAuthenticated(req) && helpers.getUser(req).isAdmin) return next()
    return res.redirect('/')
  }
  // 前台 :餐廳
  app.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
  app.get('/restaurants', authenticated, restController.getRestaurants)
  app.get('/restaurants/:id', authenticated, restController.getRestaurant)
  // 前台 :評論
  app.post('/comments', authenticated, commentController.postComment)
  // 後台 :餐廳
  app.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
  app.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
  app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
  app.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
  app.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
  app.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
  app.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
  app.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
  app.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)
  // 後台 :使用者
  app.get('/admin/users', authenticatedAdmin, adminController.getUsers)
  app.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)
  // 後台 :類別
  app.get('/admin/categories', authenticatedAdmin, adminController.getCategories)
  app.post('/admin/categories', authenticatedAdmin, adminController.postCategories)
  app.get('/admin/categories/:id', authenticatedAdmin, adminController.getCategories)
  app.put('/admin/categories/:id', authenticatedAdmin, adminController.putCategory)
  app.delete('/admin/categories/:id', authenticatedAdmin, adminController.deleteCategory)
  // 註冊
  app.get('/signup', userController.signUpPage)
  app.post('/signup', userController.signUp)
  // 登入
  app.get('/signin', userController.signInPage)
  app.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
  // 登出
  app.get('/logout', userController.logout)
}
