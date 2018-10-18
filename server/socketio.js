const socketio = require('socket.io');
const socketioAuth = require('socketio-auth');

let io;

module.exports = {
  init(server, app) {
    io = socketio(server);

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
          socket.appUserId = value.userId;
        });
      },
    });

    io.on('connection', function(socket) {
      console.log('New client', socket.id);
      socket.on('disconnect', function() {
        console.log('Disconnected client', socket.id);
      });
    });
  },
  alert(data) {
    for (const client of io.sockets.clients()) {
      const appUser = data.find((d) => d.id === client.appUserId);

      if (!appUser) {
        continue;
      }

      client.emit('alert', appUser.message);
    }
  },
};
