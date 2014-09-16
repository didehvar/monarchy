var server = module.parent.exports;

var site = require('./controllers/site');
var user = require('./controllers/user');

server.get('/', site.index);

// user routes
server.post('/users', user.post);
server.get('/users', user.get);
server.put('/users', user.put);
server.del('/users', user.del);

server.get('/users/:username', user.getOne);
server.del('/users/:username', user.delOne);
