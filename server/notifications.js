// const { Observable } = require('rxjs');

// declare let Lowdb: Lowdb.lowdb;
// export = Lowdb;
export const createNotification
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
