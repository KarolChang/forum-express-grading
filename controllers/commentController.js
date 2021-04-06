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
  }
}

module.exports = commentController
