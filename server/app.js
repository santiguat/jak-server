const { Observable } = require('rxjs');
// const { } = require('rxjs/operators');
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
const { createNotification, checkNotifications } = require('./notifications');
const _ = require('lodash');
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

io.on('connection', socket => {
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

app.get('/users', (req, res) => {
  const payload = db.get('foo').values();

  res.send({ payload: payload });
});

app.post('/register', (req, res) => {
  let requestUser = req.body;
  const hashedPw = pwHash.generate(requestUser.password);
  requestUser = { ...requestUser, password: hashedPw, friends: [] };

  const isRegistered = db
    .get('users')
    .find({ username: requestUser.username })
    .value();

  if (isRegistered) {
    res.status(400).send({
      message: 'Username is already taken'
    });
    return;
  }

  db.get('users')
    .push({
      username: requestUser.username,
      password: hashedPw
    })
    .write();

  res.status(200).send({
    message: 'Registered successfully',
    code: 200
  });
});

app.post('/login', (req, res) => {
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

app.post('/user', (req, res) => {
  const usersData = req.body;

  const desiredUser = db
    .get('users')
    .find({ username: usersData.friendName })
    .value();

  if (!desiredUser) {
    res.status(404).send('User not found');
    return;
  }
  // checking if desiredUser is already a friend
  db.get('users')
    .find({ username: usersData.currentUsername })
    .get('friends')
    .thru(friends => {
      if (friends.includes(desiredUser.username)) {
        res.status(400).send({
          code: 400,
          data: `${desiredUser.username} is already a friend`
        });
      }
    });

  res.status(200).send({
    code: 200,
    data: desiredUser
  });
});

app.post('/friend-request-notification', (req, res) => {
  const { requestedUser, user } = req.body;

  const notifications = db
    .get('users')
    .find({ username: requestedUser.username })
    .get('notifications');

  const notification = {
    type: 'friendRequest',
    content: user.username
  };

  if (_.some(notifications.value(), e => _.isMatch(e, notification))) {
    res.status(400).send({
      code: 400,
      data: `Friend request already sent to ${requestedUser.username}`
    });
    return notifications;
  }

  notifications.push({ type: 'friendRequest', content: user.username }).write();

  res.status(200).send({
    code: 200,
    data: `Friend request has been sent to ${requestedUser.username}`
  });
});

app.post('/friend-request', (req, res) => {
  const requestData = req.body;
  const dbUser = db.get('users').find({ username: requestData.username });
  const friendObject = {
    name: requestData.username,
    since: new Date()
  };
  dbUser
    .get('notifications')
    .filter(notification => notification.content !== requestData.username)
    .tap(e => console.log(e)
    )
    .write();

  if (!requestData.isAccepted) {
    res.status(200).send({
      status: 200,
      content: 'User rejected'
    });
  }
  dbUser.get('friends').push(friendObject).write();

  res.status(200).send({
    code: 200,
    content: 'User accepted'
  });
});

app.get('/notifications/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const pendingNotifications = checkNotifications(userId);

  if (pendingNotifications) {
    res.status(200).send({
      status: 200,
      data: pendingNotifications
    });
  }
});

http.listen(process.env.PORT || 3000, () =>
  console.log('server listening 3000')
);
