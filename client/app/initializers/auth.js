export default {
  name: 'auth',
  before: 'simple-auth',

  initialize: function(/* container, app */) {
    window.ENV = window.ENV || {};

    window.ENV['simple-auth'] = {
      authorizer: 'simple-auth-authorizer:oauth2-bearer'
    };

    window.ENV['simple-auth-oauth2'] = {
      serverTokenEndpoint: 'http://localhost:8080/api/oauth/public_token',
      serverTokenRevocationEndpoint: 'http://localhost:8080/api/oauth/revoke',
      refreshAccessTokens: true
    };
  }
};
