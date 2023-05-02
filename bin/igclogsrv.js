#!/usr/bin/env node

const pm2 = require('pm2');

pm2.connect(function (err) {
  if (err) {
    console.error(err);
    process.exit(2);
  }

  pm2.start(
    {
      script: '../dist/srv/index.js',
      name: 'igclogsrv',
    },
    function (err, apps) {
      if (err) {
        console.error(err);
        return pm2.disconnect();
      }

      pm2.list((err, list) => {
        pm2.restart('igclogsrv', (err, proc) => {
          pm2.disconnect();
        });
      });
    },
  );
});
