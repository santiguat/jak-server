// const { Observable } = require('rxjs');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(`${__dirname}/db.json`);
const db = low(adapter);

// declare let Lowdb: Lowdb.lowdb;
// export = Lowdb;
exports.createNotification = friend => {
  db.get('users')
    .find({ username: friend.username })
    .get('notifications')
    .find('friendRequests')
    .push(friend.username)
    .write();
};

exports.checkNotifications = userId => {
  return db
    .get('users')
    .find({ id: userId })
    .get('notifications')
    .value();
};
