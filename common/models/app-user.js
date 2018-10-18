'use strict';
const loopback = require('loopback');
const map = require('../utils/map.js');
const io = require('../../server/socketio');

module.exports = function(AppUser) {
  AppUser.validatesUniquenessOf('phone');

  AppUser.observe('before save', async function(ctx) {
    if (ctx.instance && ctx.instance.phone) {
      ctx.instance.username = ctx.instance.phone;
    } else if (ctx.data && ctx.data.phone) {
      ctx.data.username = ctx.data.phone;
    }
  });

  AppUser.beforeRemote('login', async function(ctx) {
    ctx.args.credentials.username = ctx.args.credentials.phone;
    delete ctx.args.credentials.phone;
  });

  AppUser.afterRemote('prototype.__create__alerts', async function(ctx) {
    const [address, concernedUsers] = await Promise.all([
      map.reverseLocation(ctx.result.location),
      AppUser.find({
        where: {
          location: {
            near: ctx.result.location,
          },
        },
      }),
    ]);

    const data = concernedUsers.map((user) => ({
      id: user.id,
      msg:
        'Alerte provenant de ' + ctx.instance.firstname +
        'qui est à ' +
        loopback.GeoPoint.distanceBetween(user.location, ctx.result.location, {
          type: 'meters',
        }) + ' mètres. Son adresse : ' + address,
    }));

    io.alert(data);
  });
};
