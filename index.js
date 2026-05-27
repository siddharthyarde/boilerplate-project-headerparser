// index.js
// where your node app starts

require('dotenv').config();
var express = require('express');
var cors = require('cors');
var dns = require('dns');
var url = require('url');

var app = express();

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

// In-memory URL store
var urlDatabase = {};
var counter = 1;

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.post('/api/shorturl', function (req, res) {
  var originalUrl = req.body.url;

  var parsed;
  try {
    parsed = new URL(originalUrl);
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return res.json({ error: 'invalid url' });
  }

  var hostname = parsed.hostname;

  dns.lookup(hostname, function (err) {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    var shortUrl = counter++;
    urlDatabase[shortUrl] = originalUrl;
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

app.get('/api/shorturl/:short_url', function (req, res) {
  var shortUrl = parseInt(req.params.short_url);
  var originalUrl = urlDatabase[shortUrl];

  if (!originalUrl) {
    return res.json({ error: 'No short URL found for the given input' });
  }

  res.redirect(originalUrl);
});

var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
