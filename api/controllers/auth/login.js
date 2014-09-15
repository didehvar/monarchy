// app.post('/login',
//   passport.authenticate('local'),
//   function(req, res) {
//     res.redirect('/users/' + req.user.username);
//   });

var login = function(req, res) {
  
}

module.exports = function(app) {
  app.post('/login', login);
}
