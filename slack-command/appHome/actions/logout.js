const { get } = require('lodash/fp');
const { setStateValueForPath } = require('../../localStateManager');
const { publishHomePageWithState } = require('../../slack');

const logout = async (actionPayload) => {
  const slackUserId = get('user.id', actionPayload);
  
  setStateValueForPath(
    `${slackUserId}.slackAppHomeState.userPolarityCredentials.polarityCookie`,
    ''
  );

  await publishHomePageWithState(slackUserId);
};

module.exports = logout;
