var app = module.parent.exports;

var passport = require('passport'); // TODO: move to controller
var debug = require('debug')('monarchy:routes');

var site = require('./controllers/site');
var user = require('./controllers/user');
var auth = require('./controllers/auth');
var oauth = require('./controllers/oauth');

app.get('/', site.index);

// user routes
app.post('/users', user.post);
app.get('/users', user.get);
app.put('/users', user.put);
app.delete('/users', user.del);

app.post('/users/:username', user.post);
app.get('/users/:username', user.getOne);
app.put('/users/:username', user.put);
app.delete('/users/:username', user.del);

// auth routes
app.post('/oauth/token', oauth.token);

app.get('/userInfo', passport.authenticate('bearer', { session: false }),
  function(req, res) {
    res.json({
      user_id: req.user._id,
      name: req.user.username,
      scope: req.authInfo.scope
    });
  }
);
