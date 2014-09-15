var server = module.parent.exports;

var site = require('./controllers/site');

server.get('/', site.index);
