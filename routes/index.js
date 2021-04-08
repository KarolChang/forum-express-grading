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
  app.get('/restaurants/feeds', authenticated, restController.getFeeds)
  app.get('/restaurants/:id', authenticated, restController.getRestaurant)
  app.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
  // 前台 :美食達人
  app.get('/users/top', authenticated, userController.getTopUser)
  // 前台 : Profile
  app.get('/users/:id', authenticated, userController.getUser)
  app.get('/users/:id/edit', authenticated, userController.editUser)
  app.put('/users/:id', authenticated, upload.single('image'), userController.putUser)
  // 前台 :評論
  app.post('/comments', authenticated, commentController.postComment)
  // 前台 :收藏
  app.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
  app.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
  // 前台 :Like
  app.post('/like/:restaurantId', authenticated, userController.addLike)
  app.delete('/like/:restaurantId', authenticated, userController.removeLike)
  // 後台 :評論
  app.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
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
