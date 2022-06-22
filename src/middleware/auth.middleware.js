const jwt = require("jsonwebtoken")

const errorType = require("../constants/error-types")
const userService = require("../service/user.service")
const authService = require("../service/auth.service")
const md5password = require("../utils/password-handle")
const { PUBLIC_KEY } = require("../app/config")

const verifyLogin = async (ctx, next) => {
  console.log("验证登录的middleware~")

  // 1.获取用户名和密码
  const { name, password } = ctx.request.body

  // 2.判断用户名和密码是否为空
  if (!name || !password) {
    const error = new Error(errorType.NAME_OR_PASSWORD_IS_REQUIRED)
    return ctx.app.emit("error", error, ctx)
  }

  // 3.判断用户是否存在(用户不存在)
  const result = await userService.getUserByName(name)
  const user = result[0]
  // console.log(user)
  if (!user) {
    const error = new Error(errorType.USER_DOES_NOT_EXISTS)
    return ctx.app.emit("error", error, ctx)
  }

  // 4.判断密码是否和数据库中的密码是一致(加密)
  // console.log(md5password(password))
  if (md5password(password) !== user.password) {
    const error = new Error(errorType.PASSWORD_IS_INCORRECT)
    return ctx.app.emit("error", error, ctx)
  }

  ctx.user = user

  await next()
}

const verifyAuth = async (ctx, next) => {
  console.log("验证授权的middleware~")
  // 1.获取token
  const authorization = ctx.headers.authorization
  if (!authorization) {
    const error = new Error(errorType.UNAUTHORIZATION)
    return ctx.app.emit("error", error, ctx)
  }
  const token = authorization.replace("Bearer ", "")

  // 2.验证token(id/name/iat/exp)
  try {
    const result = jwt.verify(token, PUBLIC_KEY, {
      algorithms: ["RS256"],
    })
    ctx.user = result
    // console.log(ctx.user)
    await next()
  } catch (err) {
    const error = new Error(errorType.UNAUTHORIZATION)
    ctx.app.emit("error", error, ctx)
  }
}

/**
 * 1.很多的内容都需要验证权限:修改/删除动态,修改/删除评论,修改/删除头像
 * 2.接口:业务接口系统/后端管理系统
 * 一对一:user -> role
 * 多对多:role -> menu(删除动态/修改动态)
 */
const verifyPermission = async (ctx, next) => {
  console.log("验证权限的middleware~")

  // 1.获取参数
  const { momentId } = ctx.params
  const { id } = ctx.user

  // 2.查询是否具备权限
  try {
    const isPermission = await authService.checkMoment(momentId, id)
    if (!isPermission) throw new Error()
    await next()
  } catch (err) {
    const error = new Error(errorType.UNPERMISSION)
    ctx.app.emit("error", error, ctx)
  }
}

module.exports = {
  verifyLogin,
  verifyAuth,
  verifyPermission,
}
