const redis = require('redis');
var redis_config = {
    "host": "127.0.0.1",
    "port": 6379,
    "db":15
};
const client = redis.createClient(redis_config);
client.on('connect',()=>{
    console.log('Redis-15 successfully connected')
});
const async = require('async');


exports.getCurrency = (req, res) => {
    client.keys('*', (err, keys) => {
      if (err) {
        return res.json({ status: 400, message: 'could not fetch users', err });
      }
      if (keys) {
        async.map(keys, (key, cb) => {
          client.hgetall(key, (error, value) => {
            if (error) return res.json({ status: 400, message: 'Something went wrong', error });
            const user = {};
            user.userId = key;
            user.data = value;
            cb(null, user);
          });
        }, (error, users) => {
          if (error) return res.json({ status: 400, message: 'Something went wrong', error });
          res.json(users);
        });
      }
    });
  };