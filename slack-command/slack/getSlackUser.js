const { get } = require('lodash/fp');
const { requestWithDefaults } = require('../request');

const getSlackUser = async (slackUserId) => {
  const slackUser = get(
    'body.profile',
    await requestWithDefaults({
      method: 'GET',
      site: 'slack',
      route: 'users.profile.get',
      headers: { 'Content-Type': 'application/json' },
      qs: {
        user: slackUserId
      }
    })
  );

  return {
    ...slackUser,
    slackUserName: get('real_name_normalized', slackUser),
    profilePicture: get('image_48', slackUser)
  };
};

module.exports = getSlackUser;
