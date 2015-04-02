/**
 * server entry point
 * @module app
 */

var

  /** express module */
  express = require('express'),

  /** helper for parsing requests, primarily POST **/
  bodyParser = require('body-parser'),

  /** simulate PUT and DELETE */
  methodOverride = require('method-override'),

  /** server instance */
  app = express(),

  /** the port the server will listen to for requests */
  port = process.env.PORT || process.argv[2] || 8080;

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

/** handler for uncaught routes */
app.get('*', function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
});

/** take requests on specified port */
app.listen(port, '0.0.0.0');
console.log('Server listening on port ' + port + '.');

/** expose app */
module.exports = app;