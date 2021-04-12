const express = require('express')
const router = express.Router()

const adminController = require('../controllers/api/adminController')

router.get('/admin/restaurants', adminController.getRestaurants)
router.get('/admin/restaurants/:id', adminController.getRestaurant)
router.get('/admin/categories', adminController.getCategories)

module.exports = router
