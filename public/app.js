const lirc = new class lirc {
  _command(...args) {
    let result = fetch(`/lirc/${args.join('/')}`)
      .then(response => response.json());

    result.then(data => console.debug(data));

    return result.then(data => data.status !== 'OK' ? Promise.reject(data) : data);
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
  let key = element.getAttribute('key');
  let pn = element.parentNode;
  let remote = element.getAttribute('remote');
  let timeout;

  while (!remote && pn.getAttribute) {
    remote = pn.getAttribute('remote');
    pn = pn.parentNode;
  }

  if (remote && key) {
    element.addEventListener('click', () => lirc.send(remote, key));

    element.addEventListener('mousedown', () => {
      timeout = setTimeout(() => {
        lirc.press(remote, key);
        timeout = null;
      }, 300);
    });

    element.addEventListener('mouseup', () => {
      if (timeout) {
        clearTimeout(timeout);
      } else {
        lirc.release(remote, key);
      }
    });
  }
}

document.querySelector('#allpower')
  .addEventListener('click', async () => {
    await lirc.send('magnavox', 'power');
    await lirc.send('soundbar', 'power');
    await lirc.send('soundbar', 'music');
  });

document.querySelector('#soundbar')
  .addEventListener('click', async () => {
    await lirc.send('soundbar', 'power');
    await lirc.send('soundbar', 'music');
  });

window.oncontextmenu = () => false;
