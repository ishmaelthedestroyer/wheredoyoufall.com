/**
 * server entry point
 * @module app
 */

/* ==========================================================================
   Local variables, module dependencies
   ========================================================================== */

var

  /** async flow library */
  $q = require('q'),

  /** config loader */
  nconf = require('nconf'),

  /** express module */
  express = require('express'),

  /** twitter client library */
  Twit = require('twit'),

  /** helper for parsing requests, primarily POST **/
  bodyParser = require('body-parser'),

  /** simulate PUT and DELETE */
  methodOverride = require('method-override'),

  /** server instance */
  app = express(),

  /** tweet model */
  Tweet = require('./tweet'),

  /** cache to rate limit requests */
  cache = null,

  /** the port the server will listen to for requests */
  port, // = process.env.PORT || process.argv[2] || 8080;

  /** twitter client library instance */
  t;

/* ==========================================================================
   Helper functions
   ========================================================================== */

/**
 * takes an array of tweets, returns images from the statuses
 * @param tweets {Array} array of tweets
 * @returns {Array} array of photos
 */
function parseImagesFromTweets(tweets) {
  var queue = [];

  tweets.forEach(function(tweet, index) {
    if (!tweet || !tweet.entities || !tweet.entities.media || !(tweet.entities.media instanceof Array)) {
      return;
    }

    tweet.entities.media.forEach(function(media, index) {
      queue.push({
        tweetId: tweet.id,
        dateCreated: tweet.created_at,
        photoUrl: media.media_url,
        text: tweet.text
      });
    });
  });

  return queue;
}

/* ==========================================================================
  Server config
   ========================================================================== */

/** set directory for static assets */
app.use(express.static(__dirname + '/public', {
  // maxAge: 2592000000 // 30 day cache
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride());

/* ==========================================================================
   Routes
   ========================================================================== */

// PATCH: ping endpoints
app.post('/api/ping', function(req, res) {
  console.log('Got request.', req.body);
  res.status(200).json(req.body);
});

app.get('/api/ping', function(req, res) {
  res.status(200).end('pong');
});
// END PATCH

// search tweets
app.get('/tweets', function(req, res) {
  if (cache) {
    console.log('Sending back cached response.');
    return res.status(200).json(cache);
  }

  $q.fcall(function() {
    var deferred = $q.defer();

    t.get('search/tweets', { q: 'from:ryanamadormusic #wheredoyoufall'}, function(err, data, response) {
      if (err) {
        return deferred.reject(err);
      }

      return deferred.resolve(data);
    });

    return deferred.promise;
  }).then(function(tweets) {
    var
      deferred = $q.defer(),
      parsedTweets = parseImagesFromTweets(tweets.statuses),
      promises = parsedTweets.map(function(tweet) {
        var deferred2 = $q.defer();

        // make sure `photoUrl` set
        if (!tweet.photoUrl) {
          deferred2.resolve(tweet);
          return deferred2.promise;
        }

        // try and find saved tweet with same `photoUrl`
        Tweet.find({ photoUrl: tweet.photoUrl }, function(err, docs) {
          if (err) {
            // if error, get outta here
            return deferred2.reject(err);
          } else if (docs && docs.length) {
            // if tweet saved w/ `photoUrl`, get outta here
            return deferred2.resolve(true);
          }

          // no tweet saved with same `photoUrl`, save it
          var savedTweet = new Tweet(tweet);
          savedTweet.save(function(err, tweet) {
            if (err) {
              return deferred2.reject(err);
            }

            return deferred2.resolve(tweet);
          });
        });

        return deferred2.promise;
      });

    $q.all(promises)
      .then(function() {
        return deferred.resolve(parsedTweets);
      })
      .fail(function(err) {
        console.log('Error parsing or saving tweets.', err);
        return deferred.resolve(parsedTweets || []);
      });

    return deferred.promise;
  }).then(function(tweets) {
    var deferred = $q.defer();

    // try and find saved tweet with same `photoUrl`
    Tweet.find({}, function(err, docs) {
      if (err) {
        // if error, get outta here, hand back parsed tweets
        return deferred.resolve(tweets);
      }

      // loop over tweets from database, add ones that weren't returned from API
      docs.forEach(function(doc) {
        for (var i = 0, len = tweets.length; i < len; i++) {
          if (tweets[i].photoUrl && tweets[i].photoUrl === doc.photoUrl) {
            return;
          }
        }

        tweets.push(doc);
      });

      return deferred.resolve(tweets);
    });
    return deferred.promise;
  }).then(function(tweets) {
    // send back response
    res.status(200).json(tweets);

    // set cache
    cache = tweets;

    // clear cache in 5 minutes
    setTimeout(function() {
      cache = null;
    }, 1000 * 60 * 5);
  }).fail(function(err) {
    console.log('Error loading or saving tweets!', err);
    res.status(500).end();
  });
});

/** handler for uncaught routes */
app.get('*', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

/* ==========================================================================
   Initialization logic
   ========================================================================== */

// load arguments, environmental variables
nconf.argv().env();

port = process.env.PORT || nconf.get('port') || 8080;
t = new Twit({
  consumer_key: nconf.get('TWITTER_CONSUMER_KEY'),
  consumer_secret: nconf.get('TWITTER_CONSUMER_SECRET'),
  access_token: nconf.get('TWITTER_ACCESS_TOKEN'),
  access_token_secret: nconf.get('TWITTER_TOKEN_SECRET')
});

/** take requests on specified port */
app.listen(port, '0.0.0.0');
console.log('Server listening on port ' + port + '.');

/** expose app */
module.exports = app;