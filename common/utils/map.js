const request = require("request-promise-native");


module.exports = {
  async reverseLocation({lat, lng}) {
    // TODO : ask openstreetmap API to convert lat/lng to an address
    // module : request, npm install request request-promise-native --save, const request = require('request-promise-native');
    // const res = await request.get({json: {lat, lng}});

		const body = await request.get({
      headers: {
        referer: 'hdaroit.fr'
      },
      url: 'https://nominatim.openstreetmap.org/reverse',
      qs: {
        format: 'json',
        lat,
        lon: lng,
      },
      json : true,
    });
    return body.display_name;
    //https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=-34.44076&lon=-58.70521
  },
};
