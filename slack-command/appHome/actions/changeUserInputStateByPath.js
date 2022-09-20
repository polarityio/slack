const { get, includes } = require('lodash/fp');
const { encodeBase64 } = require('../../../src/dataTransformations');
const { addPolarityIntegrationsToState } = require('../../polarity');
const { setStateValueForPath } = require('../../localStateManager');
const { publishHomePageWithState } = require('../../slack');


const changeUserInputStateByPath = (path) => async (slackActionPayload) => {
  const slackUserId = get('user.id', slackActionPayload);
  const newValue = get('actions.0.value', slackActionPayload);
  
  setStateValueForPath(
    `${slackUserId}.${path}`,
    path.includes('polarityPassword') ? encodeBase64(newValue) : newValue
  );

  if(includes('slackAppHomeState', path)) {
    await addPolarityIntegrationsToState(slackUserId);
    await publishHomePageWithState(slackUserId);
  }
};

module.exports = changeUserInputStateByPath;
