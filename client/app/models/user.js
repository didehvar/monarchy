import DS from 'ember-data';

var attr = DS.attr,
    hasMany = DS.hasMany,
    belongsTo = DS.belongsTo;

export default DS.Model.extend({
  username: attr('string'),
  email: attr('string'),
  password: attr('string'),

  steamId: attr('string'),
  avatar: attr('string'),
  universityEmail: attr('string'),

  staff: attr('string'),

  skype: attr('string'),
  twitch: attr('string')
});
