const socketio = require('socket.io');
const socketioAuth = require('socketio-auth');

module.exports = function(server, app) {
  const io = socketio(server);

  socketioAuth(io, {
    authenticate(socket, value, callback) {
      const AccessToken = app.models.AccessToken;

      AccessToken.findOne({
        where: {
          and: [{
            userId: value.userId,
          }, {
            id: value.id,
          }],
        },
      }, function(err, token) {
        if (err) return callback(err);
        callback(null, !!token);
      });
    },
  });

  io.on('connection', function(socket) {
    console.log('a user connected');
    socket.on('disconnect', function() {
      console.log('user disconnected');
    });
  });
};
