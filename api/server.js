var express = require('express');
var app = express();

app.get('/api/users/:username', function(req, res, next) {
  res.json({
    "user": {
      "id": "0",
      "username": "elf",
      "email": "elf@elf.com",
      "password": "secret"
    }
  });
});

var server = app.listen(3000, function() {
  console.log('Listening on port %d', server.address().port);
});
