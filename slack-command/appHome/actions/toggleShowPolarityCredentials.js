const { get } = require('lodash/fp');
const { setStateValueForPath, getStateValueByPath } = require('../../localStateManager');
const { publishHomePageWithState } = require('../../slack');

const toggleShowPolarityCredentials = async (actionPayload) => {
  const slackUserId = get('user.id', actionPayload);

  setStateValueForPath(
    'serviceAccountCredentials.hidePolarityCredentials',
    !getStateValueByPath('serviceAccountCredentials.hidePolarityCredentials')
  );

  await publishHomePageWithState(slackUserId);
};

module.exports = toggleShowPolarityCredentials;
