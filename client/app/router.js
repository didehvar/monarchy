import Ember from 'ember';

var Router = Ember.Router.extend({
  location: MonarchyENV.locationType
});

Router.map(function() {
  this.route('user', { path: '/users/:username' });
});

export default Router;
