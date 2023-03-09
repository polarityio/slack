const { requestWithDefaults } = require('../../request');

const publishBlocksToUserHomeScreen = async (user_id, blocks) =>
  requestWithDefaults({
    method: 'POST',
    site: 'slack',
    route: 'views.publish',
    headers: { 'Content-Type': 'application/json' },
    body: {
      user_id,
      view: JSON.stringify({
        type: 'home',
        blocks
      })
    }
  });

module.exports = publishBlocksToUserHomeScreen;
