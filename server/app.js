const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(`${__dirname}/db.json`);
const db = low(adapter);
const bodyParser = require('body-parser');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method'
  );
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

io.on('connection', function(socket) {
  console.log(`user ${socket.id} connected`);
  // socket.join(`${socket.id}`, () => {
  console.log(Object.keys(socket.rooms));

  // });

  socket.on('say to someone', (msg, id) => {
    console.log('messag', msg, id);

    // send a private message to the socket with the given id
    // socket.to(id).emit('my message', msg);
  });

  socket.on('add-message', msg => {
    console.log(msg);
    msg.time = new Date();
    io.emit('new-message', msg);
  });
});

app.get('/users', function(req, res) {
  const payload = db.get('foo').values();
  console.log(payload);

  res.send({ payload: payload });
});

app.post('/register', function(req, res) {
  const user = req.body;
  db.get('users')
    .push(user)
    .write();
});

app.post('/login', function(req, res) {
  
  const candidate = req.body;
  const user = db.get('users')
    .tap(x => console.log(x)
    )
    .find(user => candidate.username === user.username)
    .value();
  console.log(user);
  
  res.send(user);
});

http.listen(3000, () => {
  console.log('server listening to 3000');
});
