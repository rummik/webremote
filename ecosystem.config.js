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
      user: 'rummik',
      host: 'handinavi',
      ref: 'origin/master',
      repo: 'https://github.com/rummik/webremote.git',
      path: '/home/rummik/webremote',
      'post-deploy': [
        'export PATH=$PATH:/opt/nodejs/bin',
        'npm install',
        'pm2 startOrRestart ecosystem.config.js --env production',
      ].join(' && '),
    },
  },
};
