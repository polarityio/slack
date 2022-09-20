const { get, has, getOr } = require('lodash/fp');

const { publishHomePageWithState } = require('../slack');
const { getStateValueByPath, setStateValueForPath } = require('../localStateManager');

const { addPolarityIntegrationsToState } = require('../polarity');
const { and } = require('../../src/dataTransformations');

const handleEventAppHomeOpened = async (slackRequest) => {
  const slackUserId = get('body.event.user', slackRequest);
  const userPolarityCredentialsPath = `${slackUserId}.slackAppHomeState.userPolarityCredentials`;
  const userPolarityCredentialsState = getStateValueByPath(userPolarityCredentialsPath);

  setStateValueForPath(userPolarityCredentialsPath, {
    ...userPolarityCredentialsState,
    showPasswordField: false,
    hidePolarityCredentials: getOr(
      false,
      'loggedIntoPolarity',
      userPolarityCredentialsState
    )
  });

  const credentialsAreEnteredInHomePageYet = and(
    has('polarityUsername'),
    has('polarityPassword')
  )(userPolarityCredentialsState);
  if (credentialsAreEnteredInHomePageYet)
    await addPolarityIntegrationsToState(slackUserId);

  await publishHomePageWithState(slackUserId);
};

module.exports = handleEventAppHomeOpened;
