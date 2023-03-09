const { get, has, getOr } = require('lodash/fp');

const { publishHomePageWithState } = require('../slack');
const { getStateValueByPath, setStateValueForPath } = require('../localStateManager');

const { addPolarityIntegrationsToState } = require('../polarity');
const { and, or } = require('../../src/dataTransformations');

const handleEventAppHomeOpened = async (slackRequestBody) => {
  const slackUserId = get('event.user', slackRequestBody);

  const polarityServiceAccountCredentials = getStateValueByPath(
    'serviceAccountCredentials'
  );

  setHidePolarityCredentials(polarityServiceAccountCredentials);

  await addPolarityIntegrationsToStateIfLoggedIn(
    slackUserId,
    polarityServiceAccountCredentials
  );

  await publishHomePageWithState(slackUserId);
};

const setHidePolarityCredentials = (polarityServiceAccountCredentials) =>
  setStateValueForPath('serviceAccountCredentials', {
    ...polarityServiceAccountCredentials,
    hidePolarityCredentials: !!getOr(
      false,
      'polarityCookie',
      polarityServiceAccountCredentials
    )
  });

const addPolarityIntegrationsToStateIfLoggedIn = async (
  slackUserId,
  polarityServiceAccountCredentials
) => {
  const credentialsHaveBeenEnteredInHomePage = or(
    and(has('polarityUsername'), has('polarityPassword')),
    has('polarityCookie')
  )(polarityServiceAccountCredentials);

  if (credentialsHaveBeenEnteredInHomePage)
    await addPolarityIntegrationsToState(slackUserId);
};

module.exports = handleEventAppHomeOpened;
