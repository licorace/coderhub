const commentService = require("../service/comment.service")

class CommentController {
  async create(ctx, next) {
    // 1.获取数据(momentId, content,id)
    const { momentId, content } = ctx.request.body
    const { id } = ctx.user

    // 2.插入到数据库中
    const result = await commentService.create(momentId, content, id)
    ctx.body = result
  }

  async reply(ctx, next) {
    // 1.获取数据(momentId, content, id, commentId)
    const { momentId, content } = ctx.request.body
    const { commentId } = ctx.params
    const { id } = ctx.user

    // 2.插入到数据库中
    const result = await commentService.reply(momentId, content, id, commentId)
    ctx.body = result
  }

  async update(ctx, next) {
    // 1.获取数据(commentId, content)
    const { commentId } = ctx.params
    const { content } = ctx.request.body

    // 2.更新数据库
    const result = await commentService.update(commentId, content)
    ctx.body = result
  }

  async remove(ctx, next) {
    // 1.获取数据(commentId)
    const { commentId } = ctx.params

    // 2.更新数据库
    const result = await commentService.remove(commentId)
    ctx.body = result
  }

  async list(ctx, next) {
    // 1.获取数据(momentId)
    const { momentId } = ctx.query
    // 2.查询数据库
    const result = await commentService.getCommentsByMomentId(momentId)
    ctx.body = result
  }
}

module.exports = new CommentController()
