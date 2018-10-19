const request = require('request-promise-native');
const cpaas = process.env.CPAAS;
const resourceId = process.env.CPAAS_RESOURCE_ID;
let token;

if (cpaas) {
  request.post({
    uri: cpaas + '/api/accounts/login',
    json: {
      username: process.env.CPAAS_USERNAME,
      password: process.env.CPAAS_PASSWORD,
    },
  }).then((body) => {
    token = body.id;
  }).catch((err) => console.error(err.error || err));
} else {
  console.log('cpaas config is missing');
}

module.exports = {
  alert(data) {
    if (!cpaas) {
      console.log('cpaas config is missing');
      return;
    }

    request.post({
      uri: `${cpaas}/api/accounts/me/resources/${resourceId}/run`,
      qs: {
        access_token: token,
      },
      json: {
        data,
      },
    }).catch((err) => console.error(err.error || err));
  },
};
