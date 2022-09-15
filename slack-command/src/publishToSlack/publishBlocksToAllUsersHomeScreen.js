const { flow, get, filter, map } = require('lodash/fp');
const { requestWithDefaults } = require('../request');

const publishBlocksToAllUsersHomeScreen = async (blocks) => {
  const slackUserIds = flow(
    get('body.members'),
    filter((member) => !(member.is_bot || member.is_app_user)),
    map(get('id'))
  )(
    await requestWithDefaults({
      method: 'POST',
      site: 'slack',
      route: 'users.list?limit=500'
    })
  );
  await Promise.all(
    map(
      async (slackUserId) => await publishBlocksToUserHomeScreen(slackUserId, blocks),
      slackUserIds
    )
  );
};

module.exports = publishBlocksToAllUsersHomeScreen;
