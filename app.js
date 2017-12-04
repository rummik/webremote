const Koa = require('koa');
const Router = require('koa-router');

const serve = require('koa-static');
const lirc = require('lirc-client');
const pify = require('pify');

const router = new Router({ prefix: '/lirc' });
const app = new Koa();

const remote = lirc({ host: '10.17.2.69' });

let queue = [];

remote.cmd = pify(remote.cmd.bind(remote));

remote.on('connect', () =>
  console.log('connected to lirc')
);

remote.on('error', error =>
  console.log(error)
);

(function next() {
  if (queue.length) {
    queue.shift().call().then(next);
  } else {
    setTimeout(next, 10);
  }
})();

router.get([ '/:p1', '/:p1/:p2', '/:p1/:p2/:p3' ], async ctx => {
  let { p1, p2, p3 } = ctx.params;

  console.log(`queuing ${p1} ${p2} ${p3}`);

  ctx.body = await new Promise(resolve =>
    queue.push(() => {
      console.log(`sending ${p1} ${p2} ${p3}`);

      return remote.cmd(p1, p2, p3)
        .then(response => resolve({ status: 'OK', response }))
        .catch(error => resolve({ status: 'ERROR', error }));
    })
  );
});

app
  .use(router.routes())
  .use(router.allowedMethods())
  .use(serve('public'))
  .use(serve('node_modules/font-awesome/fonts/'));

app.listen(3000);

console.log('listening on http://localhost:3000');
