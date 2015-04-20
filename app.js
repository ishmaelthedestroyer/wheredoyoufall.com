/**
 * server entry point
 * @module app
 */

var

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

  /** cache to rate limit requests */
  cache = null,

  /** the port the server will listen to for requests */
  port, // = process.env.PORT || process.argv[2] || 8080;

  /** twitter client library instance */
  t;

/** set directory for static assets */
app.use(express.static(__dirname + '/public', {
  // maxAge: 2592000000 // 30 day cache
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride());

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

  t.get('search/tweets', { q: 'from:ryanamadormusic #wheredoyoufall'}, function(err, data, response) {
    if (err) {
      return res.status(500).end('An error occurred loading images from Twitter.');
    }

    // set cache
    cache = data;

    // clear cache in 5 minutes
    setTimeout(function() {
      cache = null;
    }, 1000 * 60 * 5);

    return res.status(200).json(data);
  });
});

/** handler for uncaught routes */
app.get('*', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

nconf.argv().env();

port = nconf.get('port') || 8080;
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