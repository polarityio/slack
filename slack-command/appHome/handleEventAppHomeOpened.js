const { get, has, getOr } = require('lodash/fp');

const { publishHomePageWithState } = require('../slack');
const { getStateValueByPath, setStateValueForPath } = require('../localStateManager');

const { addPolarityIntegrationsToState } = require('../polarity');
const { and, or } = require('../../src/dataTransformations');

const handleEventAppHomeOpened = async (slackRequest) => {
  const slackUserId = get('body.event.user', slackRequest);
  const userPolarityCredentialsPath = `${slackUserId}.slackAppHomeState.userPolarityCredentials`;
  const userPolarityCredentialsState = getStateValueByPath(userPolarityCredentialsPath);

  setStateValueForPath(userPolarityCredentialsPath, {
    ...userPolarityCredentialsState,
    showPasswordField: false,
    hidePolarityCredentials: getOr(
      false,
      'polarityCookie',
      userPolarityCredentialsState
    )
  });

  const credentialsAreEnteredInHomePageYet = or(
    and(has('polarityUsername'), has('polarityPassword')),
    has('polarityCookie')
  )(userPolarityCredentialsState);
  if (credentialsAreEnteredInHomePageYet)
    await addPolarityIntegrationsToState(slackUserId);

  await publishHomePageWithState(slackUserId);
};

module.exports = handleEventAppHomeOpened;
