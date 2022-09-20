const { get } = require('lodash/fp');
const { setStateValueForPath, getStateValueByPath } = require('../../localStateManager');
const { publishHomePageWithState } = require('../../slack');

const toggleShowPolarityCredentials = async (actionPayload) => {
  const slackUserId = get('user.id', actionPayload);

  setStateValueForPath(
    `${slackUserId}.slackAppHomeState.userPolarityCredentials.hidePolarityCredentials`,
    !getStateValueByPath(
      `${slackUserId}.slackAppHomeState.userPolarityCredentials.hidePolarityCredentials`
    )
  );

  await publishHomePageWithState(slackUserId);
};

module.exports = toggleShowPolarityCredentials;
