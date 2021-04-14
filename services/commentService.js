const db = require('../models')
const Comment = db.Comment

const commentService = {
  // 新增評論
  postComment: async (req, res, callback) => {
    try {
      const text = req.body.text.trim()
      if (text) {
        await Comment.create({
          text: text,
          UserId: req.user.id,
          RestaurantId: req.body.restaurantId
        })
        callback({ status: 'success', message: '成功新增一則評論!', restaurantId: req.body.restaurantId })
      } else {
        callback({ status: 'error', message: '請新增非空白評論!', restaurantId: req.body.restaurantId })
      }
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  },
  // 刪除評論 (只有 admin 可以)
  deleteComment: async (req, res, callback) => {
    try {
      const comment = await Comment.findByPk(req.params.id)
      if (comment) {
        await comment.destroy()
        callback({ status: 'success', message: '成功刪除這則評論!', RestaurantId: comment.RestaurantId })
      } else {
        callback({ status: 'success', message: '這則評論不存在!', RestaurantId: comment.RestaurantId })
      }
    } catch (err) {
      console.warn(err)
      return res.render('error', { err })
    }
  }
}

module.exports = commentService
