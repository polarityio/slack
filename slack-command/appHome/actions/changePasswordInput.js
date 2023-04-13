const { get } = require('lodash/fp');
const { addPolarityIntegrationsToState } = require('../../polarity');
const { publishHomePageWithState } = require('../../slack');

const changePasswordInput = async (slackActionPayload) => {
  const slackUserId = get('user.id', slackActionPayload);
  const polarityPassword = get('actions.0.value', slackActionPayload);

  await addPolarityIntegrationsToState(slackUserId, polarityPassword);
  await publishHomePageWithState(slackUserId, polarityPassword);
};

module.exports = changePasswordInput;
