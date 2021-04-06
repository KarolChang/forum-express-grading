const db = require('../models')
const Comment = db.Comment

const commentController = {
  // 新增評論
  postComment: async (req, res) => {
    try {
      if (req.body.text) {
        await Comment.create({
          text: req.body.text,
          UserId: req.user.id,
          RestaurantId: req.body.restaurantId
        })
      }
      return res.redirect(`/restaurants/${req.body.restaurantId}`)
    } catch (err) {
      console.warn(err)
    }
  },
  // 刪除評論 (只有 admin 可以)
  deleteComment: async (req, res) => {
    try {
      const comment = await Comment.findByPk(req.params.id)
      await comment.destroy()
      return res.redirect(`/restaurants/${comment.RestaurantId}`)
    } catch (err) {
      console.warn(err)
    }
  }
}

module.exports = commentController
