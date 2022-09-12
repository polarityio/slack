const { get } = require('lodash/fp');
const { setStateValueForPath } = require('../../pseudoStateManager');
const { publishHomePageWithState } = require('../../publishToSlack');

const toggleShowPasswordButton = async (actionPayload) => {
  const slackUserId = get('user.id', actionPayload);
  const triggeringActionId = get('actions.0.action_id', actionPayload);
  const showPasswordField = triggeringActionId === 'showPasswordInputField';
  setStateValueForPath(
    `${slackUserId}.slackAppHomeState.userPolarityCredentials.showPasswordField`,
    showPasswordField
  );

  await publishHomePageWithState(slackUserId);
};

module.exports = toggleShowPasswordButton;
