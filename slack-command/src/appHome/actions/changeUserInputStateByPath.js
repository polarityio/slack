const { get, includes } = require('lodash/fp');
const { addPolarityIntegrationsToState } = require('../../polarity');
const { setStateValueForPath } = require('../../pseudoStateManager');
const { publishHomePageWithState } = require('../../publishToSlack');


const changeUserInputStateByPath = (path) => async (slackActionPayload) => {
  const slackUserId = get('user.id', slackActionPayload);
  const newValue = get('actions.0.value', slackActionPayload);
  
  setStateValueForPath(`${slackUserId}.${path}`, newValue);

  if(includes('slackAppHomeState', path)) {
    await addPolarityIntegrationsToState(slackUserId);
    await publishHomePageWithState(slackUserId);
  }
};

module.exports = changeUserInputStateByPath;
