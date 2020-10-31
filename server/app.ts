import express from 'express';
import bodyParser from 'body-parser';
import passwordHash from 'password-hash';
import _ from 'lodash';
import cors from 'cors';
import mongoose from 'mongoose';
import userModel, { User } from './models/user.model';
import { findOne } from './assets/queries';
import http from 'http';
import socket from 'socket.io';
import { createServer } from 'http';
import { GeneralMessage } from './models/general-message.model';

const app: express.Application = express();
const options: cors.CorsOptions = {
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  origin: '*',
};
app.use(cors(options));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies
const io = socket(createServer(app));

io.on('connection', (socket) => {
  socket.on('say to someone', (msg, id) => {
    console.log('messag', msg, id);

    // send a private message to the socket with the given id
    // socket.to(id).emit('my message', msg);
  });

  socket.on('add-message', (msg: GeneralMessage) => {
    //   io.emit('new-message', msg);
    //   new generalMessageModel(msg).save((err) => {
    //     if (err) {
    //       console.log('Message could not be saved', err);
    //     }
    //   });
    // });
  });
});

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

app.get('/users', (req, res) => {
  // const payload = async () => (await db).get('foo', []).value();
  // res.send({ payload: payload });
});

app.post('/register', (req, res) => {
  let requester: User = req.body;

  let isRegistered: boolean;
  userModel.findOne({ username: requester.username }, (err, exists) => {
    if (err) {
      console.log(err);
      return;
    }
    isRegistered = exists ? !!isRegistered : false;
  });

  if (isRegistered) {
    res.status(400).send({
      message: 'Username is already taken',
    });
    return;
  }

  const hashedPw = passwordHash.generate(requester.password);
  requester = { ...requester, password: hashedPw } as User;
  new userModel({
    username: requester.username,
    password: requester.password,
  }).save((err, result) => {
    if (err) {
      console.log(err);
    }
    if (result) {
      res.status(200).send({
        message: 'Registered successfully',
        code: 200,
      });
    }
  });
});

app.post('/login', (req, res) => {
  const requester: User = req.body;

  findOne({ username: requester.username }, (user: User) => {
    const pwMatch = passwordHash.verify(requester.password, user.password);
    if (!pwMatch || !user) {
      console.log('s');
      res.status(400).send({
        message: 'Invalid credentials',
      });
      return;
    }
  });

  res.status(200).send(requester);

  // userModel.findOne({ username: requester.username }, (err, result: User) => {
  //   if (err) {
  //     console.log(err);
  //     return;
  //   }
  //   user = result ? result : undefined;

  //   const pwMatch = passwordHash.verify(requester.password, user.password);
  //   if (!pwMatch || !user) {
  //     res.status(400).send({
  //       message: 'Invalid credentials',
  //     });
  //     return;
  //   }
  // });
});

app.get('/chat-history', (req, res) => {
  // const chatHistory = async () => (await db).get('generalChat').value();
  // res.status(200).send(chatHistory);
});

app.post('/user', (req, res) => {
  const { currentUsername, friendName } = req.body;
  console.log(req.body);
  const user = findOne({ username: friendName });

  if (!user) {
    res.status(404).send('User not found');
    return;
  }

  // checking if desiredUser is already a friend
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

// app.get('/notifications/:id', (req, res) => {
//   const userId = parseInt(req.params.id);
//   // const pendingNotifications = checkNotifications(userId);

//   if (pendingNotifications) {
//     res.status(200).send({
//       status: 200,
//       data: pendingNotifications,
//     });
//   }
// });

http
  .createServer(app)
  .listen(3000, () => console.log('server running on 3000'));

export default app;
