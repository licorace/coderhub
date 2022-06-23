const labelService = require("../service/label.service")
const LabelService = require("../service/label.service")

class LabelController {
  async create(ctx, next) {
    const { name } = ctx.request.body

    const result = await labelService.create(name)
    ctx.body = result
    // ctx.body = "创建标签成功~"
  }
}

module.exports = new LabelController()
