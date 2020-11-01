import { GeneralMessage, GeneralMessageModel } from '../models';
import socket from 'socket.io';

export const io = socket();

io.on('connection', (socket) => {
  socket.on('say to someone', (msg, id) => {
    console.log('messag', msg, id);

    // send a private message to the socket with the given id
    // socket.to(id).emit('my message', msg);
  });

  socket.on('add-message', (msg: GeneralMessage) => {
    console.log('messag', msg);
    io.emit('new-message', msg);
    new GeneralMessageModel(msg).save((err) => {
      if (err) {
        console.log('Message could not be saved', err);
      }
    });
  });
});
