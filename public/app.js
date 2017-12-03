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

  remote && key && element.addEventListener('click', () => {
    lirc.send(remote, key);
  });
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
