'use strict';
const map = require ('../utils/map.js');

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

    const addresse = await map.reverseLocation(ctx.result.location);

  });
};
