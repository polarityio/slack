const { get } = require('lodash/fp');
const { setStateValueForPath, getStateValueByPath } = require('../../pseudoStateManager');
const { publishHomePageWithState } = require('../../publishToSlack');

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
