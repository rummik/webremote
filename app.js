const Koa = require('koa');
const Router = require('koa-router');

const serve = require('koa-static');
const lirc = require('lirc-client');
const pify = require('pify');

const router = new Router({ prefix: '/lirc' });
const app = new Koa();

const remote = lirc({ host: '10.42.0.243' });

remote.cmd = pify(remote.cmd.bind(remote));

router.get('/:command', async ctx => {
  ctx.body = await remote
    .cmd(ctx.params.command)
    .then(response => { return { status: 'OK', response }; })
    .catch(response => { return { status: 'ERROR', response }; });
});

router.get('/:command/:arg1', async ctx => {
  ctx.body = await remote
    .cmd(ctx.params.command, ctx.params.arg1)
    .then(response => { return { status: 'OK', response }; })
    .catch(response => { return { status: 'ERROR', response }; });
});

router.get('/:command/:arg1/:arg2', async ctx => {
  ctx.body = await remote
    .cmd(ctx.params.command, ctx.params.arg1, ctx.params.arg2)
    .then(response => { return { status: 'OK', response }; })
    .catch(response => { return { status: 'ERROR', response }; });
});

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(serve('public'))
  .use(serve('node_modules/font-awesome/fonts/'));

app.listen(3000);

console.log('listening on http://localhost:3000');
