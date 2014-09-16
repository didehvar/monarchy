var server = module.parent.exports;

var site = require('./controllers/site');
var user = require('./controllers/user');

server.get('/', site.index);

// user routes
server.post('/users', user.post);
server.put('/users', user.put);
server.get('/users/:username', user.getOne);
