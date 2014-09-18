var app = module.parent.exports;

var passport = require('passport'); // TODO: move to controller
var debug = require('debug')('monarchy:routes');

var site = require('./controllers/site');
var user = require('./controllers/user');
var auth = require('./controllers/auth');
var oauth = require('./controllers/oauth');

app.get('/api/', site.index);

// user routes
app.post('/api/users', user.post);
app.get('/api/users', user.get);
app.put('/api/users', user.put);
app.delete('/api/users', user.del);

app.post('/api/users/:username', user.post);
app.get('/api/users/:username', user.getOne);
app.put('/api/users/:username', user.put);
app.delete('/api/users/:username', user.del);

// auth routes
app.post('/api/login', auth.login, oauth.authorize);
app.get('/api/oauth/authorize', oauth.authorize);
app.post('/api/oauth/token', oauth.token);
app.post('/api/oauth/public_token', oauth.public_token);
app.post('/api/oauth/revoke', oauth.revoke_token);
app.post('/api/oauth/decision', oauth.decision);

app.get('/api/userInfo', passport.authenticate('bearer', { session: false }),
  function(req, res) {
    res.json({
      user_id: req.user._id,
      name: req.user.username,
      scope: req.authInfo.scope
    });
  }
);
