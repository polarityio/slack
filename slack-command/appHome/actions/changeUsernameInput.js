const { get } = require('lodash/fp');
const { setStateValueForPath } = require('../../localStateManager');
const { publishHomePageWithState } = require('../../slack');


const changeUsernameInput = async (slackActionPayload) => {
  const slackUserId = get('user.id', slackActionPayload);
  const newValue = get('actions.0.value', slackActionPayload);
  
  setStateValueForPath(`serviceAccountCredentials.polarityUsername`, newValue);

  await publishHomePageWithState(slackUserId);
};

module.exports = changeUsernameInput;
