var app = module.parent.exports;

var site = require('./controllers/site');
var user = require('./controllers/user');
var auth = require('./controllers/authentication');

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

// -- login routes

app.post('/login', auth.login);
