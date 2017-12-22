module.exports = {
  apps: [
    {
      name: 'WEB',
      script: 'app.js',
      env_production : {
        NODE_ENV: 'production',
      },
    },
  ],

  deploy: {
    production: {
      user: 'pi',
      host: '10.17.2.190',
      ref: 'origin/master',
      repo: 'https://github.com/rummik/webremote.git',
      path: '/home/pi/webremote',
      'post-deploy': [
        'export PATH=$PATH:/opt/nodejs/bin',
        'sudo cp lircd.conf.d/* /etc/lirc/lircd.conf.d',
        'sudo service lircd reload',
        'npm install',
        'pm2 startOrRestart ecosystem.config.js --env production',
      ].join(' && '),
    },
  },
};
