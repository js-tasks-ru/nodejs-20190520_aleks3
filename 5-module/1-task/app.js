const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

const clients = new Set();

const getMessage = (ctx) =>
  new Promise((resolve, reject) => {
    clients.add(resolve);

    ctx.res.on('close', function() {
      clients.delete(resolve);
      resolve();
    });
  });

router.get('/subscribe', async (ctx, next) => {
  const message = await getMessage(ctx);
  ctx.body = message;
});

router.post('/publish', async (ctx, next) => {
  const message = ctx.request.body.message;

  if (!message) {
    ctx.throw(400, 'required field `message` is missing');
  }

  clients.forEach((i) => i(message));
  clients.clear();

  ctx.body = 'ok';
});

app.use(router.routes());

module.exports = app;
