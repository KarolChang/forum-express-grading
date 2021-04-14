const db = require('../models')
const Comment = db.Comment

const commentService = require('../services/commentService')

const commentController = {
  // 新增評論
  postComment: (req, res) => {
    commentService.postComment(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_msg', data.message)
        return res.redirect(`/restaurants/${data.restaurantId}`)
      }
      req.flash('success_msg', data.message)
      return res.redirect(`/restaurants/${data.restaurantId}`)
    })
  },
  // 刪除評論 (只有 admin 可以)
  deleteComment: (req, res) => {
    commentService.deleteComment(req, res, (data) => {
      if (data.status === 'error') {
        req.flash('error_msg', data.message)
        return res.redirect(`/restaurants/${data.RestaurantId}`)
      }
      req.flash('success_msg', data.message)
      return res.redirect(`/restaurants/${data.RestaurantId}`)
    })
  }
}

module.exports = commentController
