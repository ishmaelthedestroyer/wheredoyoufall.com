var

  /** mongo ORM */
  mongoose = require('mongoose'),

  /** mongo connection */
  connection, // = mongoose.connect(nconf.get('MONGO_URL')),

  /** config loader */
  nconf = require('nconf'),

  /**
   * url to connect to mongodb
   * @type {String}
   */
  MONGO_URL,

  /** twitter tweet schema */
  Tweet = new mongoose.Schema({
    dateCreated: {
      type: Date
    },
    photoUrl: {
      type: String
    },
    text: {
      type: String
    },
    tweetId: {
      type: String
    }
  });

nconf.argv().env();
connection = mongoose.connect(nconf.get('MONGO_URL') || 'mongodb://localhost/wheredoyoufall');

mongoose.model('Tweet', Tweet);
module.exports = connection.model('Tweet', Tweet);