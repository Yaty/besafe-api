'use strict';
const loopback = require('loopback');
const map = require('../utils/map.js');
const io = require('../../server/socketio');
const server = require('../../server/server');

module.exports = function(AppUser) {
  AppUser.validatesUniquenessOf('phone');

  // Copy phone into username
  AppUser.observe('before save', async function(ctx) {
    if (ctx.instance && ctx.instance.phone) {
      ctx.instance.username = ctx.instance.phone;
    } else if (ctx.data && ctx.data.phone) {
      ctx.data.username = ctx.data.phone;
    }
  });

  // Use phone as an username
  AppUser.beforeRemote('login', async function(ctx) {
    ctx.args.credentials.username = ctx.args.credentials.phone;
    delete ctx.args.credentials.phone;
  });

  // Use last user location if not alert location provided
  AppUser.beforeRemote('prototype.__create__alerts', async function(ctx) {
    ctx.args.data.location = ctx.args.data.location || ctx.instance.location;
  });

  // Link responders to an alert, send the alert via Socket.io
  AppUser.afterRemote('prototype.__create__alerts', async function(ctx) {
    const [responders, address] = await Promise.all([
      AppUser.find({
        where: {
          location: {
            near: ctx.result.location,
            maxDistance: 1,
            unit: 'kilometers',
          },
          id: {
            neq: ctx.instance.id,
          },
        },
      }),
      map.reverseLocation(ctx.result.location),
    ]);

    const Responder = server.models.Responder;
    const data = [];

    for (const responder of responders) {
      const {id} = await Responder.create({
        alertId: ctx.result.id,
        appUserId: responder.id,
      });

      data.push({
        responseId: id,
        appUserId: responder.id,
        msg:
          'Alerte provenant de ' + ctx.instance.firstname +
          ' qui est à ' +
          Math.round(
              loopback.GeoPoint.distanceBetween(
                  responder.location,
                  ctx.result.location,
                  {
                    type: 'meters',
                  }
              )
          ) + ' mètres. Situé au : ' + address,
      });
    }

    io.alert(data);
  });

  AppUser.resolveAlert = async function(appUserId, responseId) {
    const Responder = server.models.Responder;
    const response = await Responder.findById(responseId);

    if (!response) {
      return;
    }

    await response.updateAttribute('helped', true);
  };

  AppUser.remoteMethod('resolveAlert', {
    accepts: [{
      arg: 'id',
      type: 'string',
      required: true,
    }, {
      arg: 'fk',
      type: 'string',
      required: true,
    }],
    http: {verb: 'post', path: '/:id/responses/:fk/resolve'},
  });
};
