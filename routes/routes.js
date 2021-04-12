const express = require('express')
const router = express.Router()

const restController = require('../controllers/restController')
const adminController = require('../controllers/adminController')
const userController = require('../controllers/userController')
const commentController = require('../controllers/commentController')

const multer = require('multer')
const upload = multer({ dest: 'temp/' })
const passport = require('../config/passport')

const helpers = require('../_helpers')

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
router.get('/', authenticated, (req, res) => res.redirect('/restaurants'))
router.get('/restaurants', authenticated, restController.getRestaurants)
router.get('/restaurants/feeds', authenticated, restController.getFeeds)
router.get('/restaurants/top', authenticated, userController.getTopRestaurant)
router.get('/restaurants/:id', authenticated, restController.getRestaurant)
router.get('/restaurants/:id/dashboard', authenticated, restController.getDashboard)
// 前台 :美食達人
router.get('/users/top', authenticated, userController.getTopUser)
// 前台 :追蹤美食達人
router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete('/following/:userId', authenticated, userController.removeFollowing)
// 前台 : Profile
router.get('/users/:id', authenticated, userController.getUser)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.put('/users/:id', authenticated, upload.single('image'), userController.putUser)
// 前台 :評論
router.post('/comments', authenticated, commentController.postComment)
// 前台 :收藏
router.post('/favorite/:restaurantId', authenticated, userController.addFavorite)
router.delete('/favorite/:restaurantId', authenticated, userController.removeFavorite)
// 前台 :Like
router.post('/like/:restaurantId', authenticated, userController.addLike)
router.delete('/like/:restaurantId', authenticated, userController.removeLike)
// 後台 :評論
router.delete('/comments/:id', authenticatedAdmin, commentController.deleteComment)
// 後台 :餐廳
router.get('/admin', authenticatedAdmin, (req, res) => res.redirect('/admin/restaurants'))
router.get('/admin/restaurants', authenticatedAdmin, adminController.getRestaurants)
router.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
router.get('/admin/restaurants/create', authenticatedAdmin, adminController.createRestaurant)
router.post('/admin/restaurants', authenticatedAdmin, upload.single('image'), adminController.postRestaurant)
router.get('/admin/restaurants/:id', authenticatedAdmin, adminController.getRestaurant)
router.get('/admin/restaurants/:id/edit', authenticatedAdmin, adminController.editRestaurant)
router.put('/admin/restaurants/:id', authenticatedAdmin, upload.single('image'), adminController.putRestaurant)
router.delete('/admin/restaurants/:id', authenticatedAdmin, adminController.deleteRestaurant)
// 後台 :使用者
router.get('/admin/users', authenticatedAdmin, adminController.getUsers)
router.put('/admin/users/:id/toggleAdmin', authenticatedAdmin, adminController.toggleAdmin)
// 後台 :類別
router.get('/admin/categories', authenticatedAdmin, adminController.getCategories)
router.post('/admin/categories', authenticatedAdmin, adminController.postCategories)
router.get('/admin/categories/:id', authenticatedAdmin, adminController.getCategories)
router.put('/admin/categories/:id', authenticatedAdmin, adminController.putCategory)
router.delete('/admin/categories/:id', authenticatedAdmin, adminController.deleteCategory)
// 註冊
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
// 登入
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', { failureRedirect: '/signin', failureFlash: true }), userController.signIn)
// 登出
router.get('/logout', userController.logout)

module.exports = router
