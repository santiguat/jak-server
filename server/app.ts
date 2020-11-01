import passwordHash from 'password-hash'
import _ from 'lodash'
import { User, UserModel } from './models/user.model'
import { findOne } from './assets/queries'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { GeneralMessageModel } from './models'
import { Notification, NotificationModel } from './models/notification.model'
import { RequestBody, FriendUserModel } from './types/types'

const app: express.Application = express()

app.use(bodyParser.json()) // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: false })) // support encoded bodies

const options: cors.CorsOptions = {
  methods: 'GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE',
  credentials: true,
  origin: '*',
}

app.use(cors(options))

app.post('/login', (req, res) => {
  const requester: User = req.body
  findOne({ username: requester.username }, (user: User) => {
    const pwMatch = passwordHash.verify(requester.password, user.password)
    if (!pwMatch || !user) {
      res.status(400).send({
        message: 'Invalid credentials',
      })
      return
    }
  })
  res.status(200).send(requester)
})

app.post('/register', (req, res) => {
  let requester: User = req.body

  let isRegistered: boolean
  UserModel.findOne({ username: requester.username }, (err, exists) => {
    if (err) {
      console.log(err)
      return
    }
    isRegistered = exists ? !!isRegistered : false
  })

  if (isRegistered) {
    res.status(400).send({
      message: 'Username is already taken',
    })
    return
  }

  const hashedPw = passwordHash.generate(requester.password)
  requester = { ...requester, password: hashedPw } as User
  new UserModel({
    username: requester.username,
    password: requester.password,
  }).save((err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.status(200).send({
        message: 'Registered successfully',
        code: 200,
      })
    }
  })
})

app.get('/chat-history', (req, res) => {
  GeneralMessageModel.find((err, result) => {
    if (err) {
      console.log(err)
    } else {
      res.status(200).send(result)
    }
  })
})

// app.post('/user', (req, res) => {
//   const { currentUsername, friendName } = req.body;
//   console.log(req.body);
//   const user = findOne({ username: friendName });

//   if (!user) {
//     res.status(404).send('User not found');
//     return;
//   }

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
// });

app.post(
  '/friend-request-notification',
  (req: RequestBody<FriendUserModel>, res) => {
    const { requestedUser, user } = req.body

    let notifications: Notification[]

    findOne({ username: requestedUser.username }, (res: User) => {
      notifications = res.notifications
    })

    const notification = {
      type: 'friendRequest',
      content: user.username,
    }
    console.log(notifications)
    if (
      _.some(
        notifications,
        (e: Notification) => e.sender.username === notification.content
      )
    ) {
      res.status(400).send({
        code: 400,
        data: `Friend request already sent to ${requestedUser.username}`,
      })
      return notifications
    }

    notifications
      .push({ type: 'friendRequest', content: user.username })
      .write()

    res.status(200).send({
      code: 200,
      data: `Friend request has been sent to ${requestedUser.username}`,
    })
  }
)

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
export default app
