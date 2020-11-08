import passwordHash from 'password-hash';
import _ from 'lodash';
import { User, UserModel } from './models/user.model';
import { findOne } from './assets/queries';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { GeneralMessageModel } from './models';
import { Notification, NotificationModel } from './models/notification.model';
import { RequestBody, FriendUserModel, FriendNameModel } from './types/types';
import { Document, DocumentQuery, Model, Types } from 'mongoose';
import { request } from 'http';
import { resolve } from 'path';

const app: express.Application = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })); // support encoded bodies

const options: cors.CorsOptions = {
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  credentials: true,
  origin: '*',
};

app.use(cors(options));

app.post('/login', (req, res) => {
  const requester: User = req.body;
  UserModel.findOne({ username: requester.username }, (err, user: User) => {
    const pwMatch = passwordHash.verify(requester.password, user?.password);
    console.log('foo');

    if (!pwMatch || !user) {
      res.status(400).send({
        message: 'Invalid credentials',
      });
      return;
    }

    res.status(200).send(requester);
  });
});

app.post('/register', (req, res) => {
  let requester: User = req.body;

  UserModel.findOne({ username: requester.username }, (err, exists) => {
    if (err) {
      console.log(err);
      return;
    }

    if (exists) {
      res.status(400).send({
        message: 'Username is already taken',
      });
      return;
    }

    const hashedPw = passwordHash.generate(requester.password);
    requester = { username: requester.username, password: hashedPw } as User;

    new UserModel({
      username: requester.username,
      password: requester.password,
    }).save((err, result) => {
      if (err) {
        console.log(err);
      } else {
        res.status(200).send({
          message: 'Registered successfully',
          code: 200,
        });
      }
    });
  });
});

app.get('/chat-history', (req, res) => {
  GeneralMessageModel.find((err, result) => {
    if (err) {
      console.log(err);
    } else {
      res.status(200).send(result);
    }
  });
});

app.post('/friend-request', (req: RequestBody<FriendNameModel>, res) => {
  const { currentUser, friendName } = req.body;
  let [requester, requested]: User[] = [];

  if (currentUser.username === friendName) {
    res.status(400).send({
      code: 400,
      data: `Too bad you don't have any friend but yourself :(`,
    });
    return;
  }

  UserModel.find(
    {
      username: { $in: [currentUser.username, friendName] },
    },
    (err, result: User[]) => {
      [requester, requested] = result;

      if (!requested) {
        res.status(404).send({
          code: 400,
          data: `${friendName} user does not exist`,
        });
        return;
      }

      if (requested.friends.find((friend: User) => requester.username === friend.username)) {
        res.status(400).send({
          code: 400,
          data: `${requested.username} is already a friend`,
        });
        return;
      }

      if (requested.notifications.includes(requester._id)) {
        res.status(400).send({
          code: 400,
          data: `Friend request already sent to ${requested.username}`,
        });
        return;
      }

      new NotificationModel({
        receiver: requested._id,
        sender: requester._id,
        creation_date: new Date(),
      })
        .save()
        .catch((err) => {
          console.log(err);
          return;
        });

      requested.updateOne({ $push: { notifications: { _id: requester._id } } }, (err) => {
        if (err) {
          console.log(err);
          return;
        }

        res.status(200).send({
          code: 200,
          data: `Friend request sent to ${requested.username}`,
        });
      });
    }
  );
});

// app.post('/friend-request', (req, res) => {
//   const requestData = req.body;
//   // const dbUser = async () =>
//   //   (await db).get('users').find({ username: requestData.username });
//   // const friendObject: User = {
//   //   username: requestData.username,
//   //   since: new Date(),
//   // };
//   // dbUser
//   //   .get('notifications')
//   //   .filter((notification) => notification.content !== requestData.username)
//   //   .tap((e) => console.log(e))
//   //   .write();

//   if (!requestData.isAccepted) {
//     res.status(200).send({
//       status: 200,
//       content: 'User rejected',
//     });
//   }
//   // dbUser.get('friends').push(friendObject).write();

//   res.status(200).send({
//     code: 200,
//     content: 'User accepted',
//   });
// });

// // app.get('/notifications/:id', (req, res) => {
// //   const userId = parseInt(req.params.id);
// //   // const pendingNotifications = checkNotifications(userId);

// //   if (pendingNotifications) {
// //     res.status(200).send({
// //       status: 200,
// //       data: pendingNotifications,
// //     });
// //   }
// // });
// const server = createServer(app);
// server.listen(process.env.PORT || 3000, () =>
//   console.log('server running on 3000')
// );
export default app;
