const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(`${__dirname}/db.json`);
const db = low(adapter);
const bodyParser = require('body-parser');
const pwHash = require('password-hash');

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
    io.emit('new-message', msg);

    db.get('general-chat')
      .push(msg)
      .write();
  });
});

app.get('/users', function(req, res) {
  const payload = db.get('foo').values();

  res.send({ payload: payload });
});

app.post('/register', function(req, res) {
  const user = req.body;
  const hashedPw = pwHash.generate(user.password);

  const isRegistered = db
    .get('users')
    .find({ username: user.username })
    .value();

  if (isRegistered) {
    res.status(400).send({
      message: 'Username is already taken'
    });
    return;
  }

  db.get('users')
    .push({
      username: user.username,
      password: hashedPw
    })
    .write();

  res.status(200).send({
    message: 'Registered successfully',
    code: 200
  });
});

app.post('/login', function(req, res) {
  const candidate = req.body;
  const user = db
    .get('users')
    .find({
      username: candidate.username
    })
    .value();

  if (!user) {
    return;
  }

  const pwMatch = pwHash.verify(candidate.password, user.password);

  if (!pwMatch || !user) {
    res.status(400).send({
      message: 'Invalid credentials'
    });
    return;
  }
  res.status(200).send(user);
});

app.get('/chat-history', (req, res) => {
  const chatHistory = db.get('general-chat').value();

  res.status(200).send(chatHistory);
});

app.get('/user/:name', (req, res) => {
  const name = req.params.name;

  const desiredUser = db
    .get('users')
    .find({ username: name })
    .value();

  if (!desiredUser) {
    res.status(404).send('User not found');
    return;
  }
  res.status(200).send(desiredUser);
});

http.listen(process.env.PORT || 3000, () =>
  console.log('server listening 3000')
);
