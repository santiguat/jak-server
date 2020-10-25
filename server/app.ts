import socket from 'socket.io';
import lowdb from 'lowdb';
import { Observable } from 'rxjs';
import express, { Response } from 'express';
import bodyParser from 'body-parser';
import FileAsync from 'lowdb/adapters/FileAsync';
import passwordHash from 'password-hash';
import _ from 'lodash';
import { createServer, IncomingMessage, request, ServerResponse } from 'http';
import cors from 'cors';
import mongoose, { Document, model, Model, Mongoose, Schema } from 'mongoose';
import { User } from './types/types';
import { UserSchema } from './schemas/schemas';

const app: express.Application = express();
const options: cors.CorsOptions = {
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: '*',
};

app.use(cors(options));

const adapter = new FileAsync<Schema>('./db.json');
// const db = lowdb(adapter);
// const { } = require('rxjs/operators');
const io = socket(createServer(app));
const { createNotification, checkNotifications } = require('./notifications');
const privates = require('./privates');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies

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
const db = mongoose.connection;
io.on('connection', (socket) => {
  socket.on('say to someone', (msg, id) => {
    console.log('messag', msg, id);

    // send a private message to the socket with the given id
    // socket.to(id).emit('my message', msg);
  });

  socket.on('add-message', (msg) => {
    io.emit('new-message', msg);

    // async () => (await db).get('generalChat', []).push(msg).write();
  });
});

app.get('/users', (req, res) => {
  // const payload = async () => (await db).get('foo', []).value();

  // res.send({ payload: payload });
});

app.post('/register', (req, res) => {
  let requester: User = req.body;
  const userModel: Model<Document> = model('User', UserSchema);
  const isRegistered = userModel
    .exists({ username: requester.username },
      (err, exists) => {
        if (err) {
          console.log(err);
        }
        console.log(exists);
        
        if (!exists) {
          res.status(400).send({
            message: 'Username is already taken',
          });
          return;
        }
      },
    );

  if (!isRegistered) {

  }

  const hashedPw = passwordHash.generate(requester.password);
  requester = { ...requester, password: hashedPw } as User;
  new userModel({
    username: requester.username,
    password: requester.password,
  }).save((err, result) => {
    console.log('err', err, 'res', result);
    if (result) {
      res.status(200).send({
        message: 'Registered successfully',
        code: 200,
      });
    }
  });
});

app.post('/login', (req, res) => {
  // const candidate = req.body;
  // const user = async () =>
  //   (await db)
  //     .get('users')
  //     .find({
  //       username: candidate.username,
  //     })
  //     .value();

  // if (!user) {
  //   console.log('user does not exist');
  //   return;
  // }

  // const pwMatch = passwordHash.verify(candidate.password, 'asd');

  // if (!pwMatch || !user) {
  //   res.status(400).send({
  //     message: 'Invalid credentials',
  //   });
  //   return;
  // }
  // res.status(200).send(user);
});

app.get('/chat-history', (req, res) => {
  // const chatHistory = async () => (await db).get('generalChat').value();

  // res.status(200).send(chatHistory);
});

app.post('/user', (req, res) => {
  const usersData = req.body;

  // const desiredUser = async () =>
  //   (await db).get('users').find({ username: usersData.friendName }).value();

  // if (!desiredUser) {
  //   res.status(404).send('User not found');
  //   return;
  // }
  // // checking if desiredUser is already a friend
  // async () =>
  //   (await db)
  //     .get('users')
  //     .find({ username: usersData.currentUsername })
  //     .get('friends')
  //     .thru((friends: User[]) => {
  //       if (
  //         friends.find((user: User) => user.username === 'leo')
  //       ) {
  //         res.status(400).send({
  //           code: 400,
  //           data: `${'desiredUsername.username'} is already a friend`,
  //         });
  //       }
  //     });

  //   res.status(200).send({
  //     code: 200,
  //     data: desiredUser,
  //   });
  // });
});

app.post('/friend-request-notification', (req, res) => {
  const { requestedUser, user } = req.body;

  // const notifications = db
  //   .get('users')
  //   .find({ username: requestedUser.username })
  //   .get('notifications');

  const notification = {
    type: 'friendRequest',
    content: user.username,
  };

  // if (_.some(notifications.value(), (e) => _.isMatch(e, notification))) {
  //   res.status(400).send({
  //     code: 400,
  //     data: `Friend request already sent to ${requestedUser.username}`,
  //   });
  //   return notifications;
  // }

  // notifications.push({ type: 'friendRequest', content: user.username }).write();

  res.status(200).send({
    code: 200,
    data: `Friend request has been sent to ${requestedUser.username}`,
  });
});

app.post('/friend-request', (req, res) => {
  const requestData = req.body;
  // const dbUser = async () =>
  //   (await db).get('users').find({ username: requestData.username });
  // const friendObject: User = {
  //   username: requestData.username,
  //   since: new Date(),
  // };
  // dbUser
  //   .get('notifications')
  //   .filter((notification) => notification.content !== requestData.username)
  //   .tap((e) => console.log(e))
  //   .write();

  if (!requestData.isAccepted) {
    res.status(200).send({
      status: 200,
      content: 'User rejected',
    });
  }
  // dbUser.get('friends').push(friendObject).write();

  res.status(200).send({
    code: 200,
    content: 'User accepted',
  });
});

app.get('/notifications/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const pendingNotifications = checkNotifications(userId);

  if (pendingNotifications) {
    res.status(200).send({
      status: 200,
      data: pendingNotifications,
    });
  }
});

app.listen(3000, () => console.log('server running on 3000'));
