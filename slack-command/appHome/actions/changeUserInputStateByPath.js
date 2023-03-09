const { get, includes } = require('lodash/fp');
const { setStateValueForPath } = require('../../localStateManager');
const { publishHomePageWithState } = require('../../slack');


const changeUserInputStateByPath = (path) => async (slackActionPayload) => {
  const slackUserId = get('user.id', slackActionPayload);
  const newValue = get('actions.0.value', slackActionPayload);
  
  setStateValueForPath(`${slackUserId}.${path}`, newValue);

  if(includes('slackAppHomeState', path)) {
    await publishHomePageWithState(slackUserId);
  }
};

module.exports = changeUserInputStateByPath;
