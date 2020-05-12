const socketio = require('socket.io');
const RoomEntrant = require('../models/multiplayer/roomEntrant')
let io = null;

class SocketManager {

    listen(server) {
        io = socketio.listen(server);
    
        io.on('connection', socket => {
            socket.send('message', 'welcome to levelcup');
            socket.on('keep-alive', async (message) => {
                var entrant = await RoomEntrant.findOne({ roomId: message.roomId, userId: message.userId });
                if(entrant != null) {
                    entrant.lastKeepAlive = new Date();
                    await entrant.save();
                }
            });
        });
    
    }

    emit(event, data) {
        io.emit(event, data);
    }
}

module.exports = new SocketManager();