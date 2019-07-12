module.exports = function mustBeAuthenticated(ctx, next) {
  if (!ctx.user) {
    ctx.body = ctx.throw(401, 'Пользователь не залогинен');
  }
  return next();
};
