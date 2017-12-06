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

let elements = document.querySelectorAll('a, g, path, circle, rect');

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
    let start = ({ type }) => {
      timeout = setTimeout(() => {
        lirc.press(remote, key);
        timeout = null;
      }, 300);

      if (type === 'mousedown') {
        element.removeEventListener('touchstart', start);
        window.addEventListener('mousemove', move);
        window.addEventListener('mouseup', stop);
      } else {
        element.removeEventListener('mousedown', start);
        window.addEventListener('touchmove', move);
        window.addEventListener('touchend', stop);
      }
    };

    let move = ev => {
      let { pageX: x, pageY: y } = ev.touches ? ev.touches[0] : ev;
      let el = document.elementFromPoint(x, y);

      for (;el !== element && el.getAttribute; el = el.parentNode);

      if (el !== element) {
        stop(ev, true);
      }
    };

    let stop = ({ type }, cancel=false) => {
      if (timeout) {
        clearTimeout(timeout);

        if (!cancel) {
          lirc.send(remote, key);
        }
      } else {
        lirc.release(remote, key);
      }

      window.removeEventListener('mousemove', move);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchend', stop);
    };

    element.addEventListener('mousedown', start);
    element.addEventListener('touchstart', start);
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
