const Koa = require('koa');
const Router = require('koa-router');
const { Lirc } = require('lirc-client');

const serve = require('koa-static');

const router = new Router({ prefix: '/lirc' });
const app = new Koa();

const lirc = new Lirc({ host: '10.17.2.190' });

lirc.on('connect', () =>
  console.log('connected to lirc')
);

lirc.on('error', error => {
  console.log(error);
});

router.get([ '/:p1', '/:p1/:p2', '/:p1/:p2/:p3' ], async ctx => {
  let { p1, p2, p3 } = ctx.params;

  console.log('received:', ctx.params);

  ctx.body = await lirc.send(p1, p2, p3)
    .then(response => ({ status: 'OK', response }))
    .catch(error => ({ status: 'ERROR', error }));
});

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(serve('public'))
  .use(serve('node_modules/material-design-icons/iconfont'));

app.listen(process.env.PORT || 3000, () => {
  console.log(`listening on http://localhost:${process.env.PORT || 3000}`);
});

