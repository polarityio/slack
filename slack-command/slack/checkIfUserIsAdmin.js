const { get } = require('lodash/fp');
const { requestWithDefaults } = require('../request');

const checkIfUserIsAdmin = async (slackUserId) =>
  get(
    'body.user.is_admin',
    await requestWithDefaults({
      method: 'GET',
      site: 'slack',
      route: 'users.info',
      headers: { 'Content-Type': 'application/json' },
      qs: {
        user: slackUserId
      }
    }).catch((err) => false)
  );

module.exports = checkIfUserIsAdmin;
