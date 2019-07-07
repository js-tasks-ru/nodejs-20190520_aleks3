const Koa = require('koa');
const Router = require('koa-router');
const mongoose = require('mongoose');
const User = require('./models/User');
const _ = require('lodash');

const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

handleErrors = (ctx, err) => {
  const errors = {errors: {}};

  for (key in err.errors) {
    console.log(key);
    errors.errors[key] = err.errors[key].properties.message;
  }
  ctx.status = 400;
  ctx.body = errors;
};

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status) {
      ctx.status = err.status;
      ctx.body = {error: err.message};
    } else {
      ctx.status = 500;
      ctx.body = {error: 'Internal server error'};
    }
  }
});

const router = new Router();

router.get('/users', async (ctx) => {
  ctx.body = await User.find();
});

router.get('/users/:id', async (ctx) => {
  const id = ctx.params.id;
  if (mongoose.Types.ObjectId.isValid(id)) {
    const user = await User.findById(id);
    if (!user) {
      ctx.status = 404;
      ctx.body = 'user not found';
    } else ctx.body = user;
  } else {
    ctx.status = 400;
    ctx.body = 'incorrect id';
  }
});

router.patch('/users/:id', async (ctx) => {
  const fields = _.pick(ctx.request.body, ['email', 'displayName']);
  const id = ctx.params.id;
  if (mongoose.Types.ObjectId.isValid(id)) {
    await User.findByIdAndUpdate(ctx.params.id, fields, {
      new: true,
      runValidators: true,
    })
        .then((user) => {
          ctx.body = user;
        })
        .catch((err) => handleErrors(ctx, err));
  } else {
    ctx.status = 400;
    ctx.body = 'incorrect id';
  }
});

router.post('/users', async (ctx) => {
  await User.create(ctx.request.body)
      .then((user) => (ctx.body = user))
      .catch((err) => {
        handleErrors(ctx, err);
      });
});

router.delete('/users/:id', async (ctx) => {
  const userId = ctx.params.id;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    makeErrorResponse(ctx, 'incorrect id');
    return;
  }
  const deleteUser = await User.deleteOne({_id: userId});
  if (deleteUser.deletedCount === 0) {
    ctx.status = 404;
  } else {
    ctx.body = deleteUser;
  }
});

app.use(router.routes());

module.exports = app;
