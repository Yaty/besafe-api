const request = require("request");


module.exports = {
  reverseLocation(lat, lng) {
    // TODO : ask openstreetmap API to convert lat/lng to an address
    // module : request, npm install request request-promise-native --save, const request = require('request-promise-native');
    // const res = await request.get({json: {lat, lng}});

		const url = "https://nominatim.openstreetmap.org/reverse?format=json&lat="+lat+"&lon="+lng;
		request.get(url, (error, response, body) => {
		  let json = JSON.parse(body);
		  const adresse = json.adresse.road();
		  console.log(adresse);
		});
    //https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=-34.44076&lon=-58.70521
  },
};
