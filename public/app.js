const lirc = new class lirc {
  constructor() {
    let queue = this._queue = [];

    (function next() {
      if (queue.length) {
        queue.shift().call().then(next);
      } else {
        setTimeout(next, 10);
      }
    })();
  }

  _command(...args) {
    console.debug('queuing', args.join(' '));

    return new Promise(resolve =>
      this._queue.push(() => {
        console.debug('sending', args.join(' '));

        return fetch(`/lirc/${args.join('/')}`)
          .then(response => response.json())
          .then(data => {
            console.debug('received:', data);
            resolve(data);
            return data;
          });
      })
    );
  }

  send(remote, code) {
    return this._command('send_once', remote, `key_${code}`);
  }

  press(remote, code) {
    return this._command('send_start', remote, `key_${code}`);
  }

  release(remote, code) {
    return this._command('send_stop', remote, `key_${code}`);
  }
};

let elements = document.querySelectorAll('g, path, circle, rect');

for (let element of elements) {
  let remote = element.getAttribute('remote');
  let key = element.getAttribute('key');
  let pn = element.parentNode;

  while (!remote && pn.getAttribute) {
    remote = pn.getAttribute('remote');
    pn = pn.parentNode;
  }

  if (remote && key) {
    element.addEventListener('press', () => lirc.send(remote, key));
    element.addEventListener('touchstart', () => lirc.press(remote, key));
    element.addEventListener('touchend', () => lirc.release(remote, key));
    element.addEventListener('selectstart', () => false);
    element.setAttribute('unselectable', 'on');
  }
}

document.querySelector('#allpower')
  .addEventListener('click', async () => {
    await lirc.send('magnavox', 'power');
    await lirc.send('soundbar', 'power');
    await lirc.send('soundbar', 'music');
    await lirc.send('soundbar', 'bluetooth');
    await lirc.send('soundbar', 'input');
  });

document.querySelector('#soundbar')
  .addEventListener('click', async () => {
    await lirc.send('soundbar', 'power');
    await lirc.send('soundbar', 'music');
    await lirc.send('soundbar', 'bluetooth');
    await lirc.send('soundbar', 'input');
  });

document.querySelector('#soundbar-tv')
  .addEventListener('click', async () => {
    await lirc.send('soundbar', 'bluetooth');
    await lirc.send('soundbar', 'input');
  });

window.oncontextmenu = () => false;
