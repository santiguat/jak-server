// src/server.ts
import { createServer } from 'http';
import mongoose from 'mongoose';
import app from './app';
import { io } from './chat/socket';

app.set('port', process.env.PORT || 3000);

// MongoDB connection

mongoose.connect(
  'mongodb://127.0.0.1:27017',
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    console.log('connect to database', err);
  }
);

// Express server declaration
const server = createServer(app);

server.listen(3000, function () {
  console.log('listening on *:3000');
});

//  Load SocketIO endpoints
io.listen(server);

process.on('uncaughtException', (err) => {
  server.close();
});

export default server;
