const socketio = require('socket.io');
const socketioAuth = require('socketio-auth');

let io;
const alertQueue = [];

module.exports = {
  init(server, app) {
    io = socketio(server);

    socketioAuth(io, {
      authenticate(socket, value, callback) {
        console.log('Authenticating socket', value);
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
          console.log('Authenticated :', !!token);
          callback(null, !!token);
          socket.appUserId = String(value.userId);

          let missedAlerts = 0;

          for (let i = 0; i < alertQueue.length; i++) {
            if (alertQueue[i].appUserId === socket.appUserId) {
              missedAlerts++;
              alertQueue.splice(i, 1);
            }
          }

          if (missedAlerts > 0) {
            socket.emit('missed-alerts', missedAlerts);
          }
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
    const sockets = Object.values(io.sockets.sockets);

    for (const alert of data) {
      const clientSocket = sockets.find(
          (s) => String(s.appUserId) === String(alert.appUserId)
      );

      if (clientSocket) { // Send
        clientSocket.emit('alert', alert);
        console.log('Alert sent in IO');
      } else { // Queue
        alertQueue.push(alert);
        console.log('Queued.');
      }
    }
  },
  newResponse(appUserId, total) {
    const clientSocket = Object.values(io.sockets.sockets).find(
        (s) => String(s.appUserId) === String(appUserId)
    );

    if (!clientSocket) {
      return;
    }

    clientSocket.emit('new-response', total);
  },
};
