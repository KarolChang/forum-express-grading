const commentService = require('../commentController')

const commentController = {
  // 新增評論
  postComment: (req, res) => {
    commentService.postComment(req, res, (data) => {
      return res.json(data)
    })
  },
  // 刪除評論 (只有 admin 可以)
  deleteComment: (req, res) => {
    commentService.deleteComment(req, res, (data) => {
      return res.json(data)
    })
  }
}

module.exports = commentController
