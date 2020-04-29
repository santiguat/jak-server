const mongo = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';

mongo.connect(
  url,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  (err, client) => {
    if (err) {
      console.error(err);
    }
    const db = client.db('jak')
    const collection = db.collection('users');
    collection.insert({ name: 'foo' });
  }
);
