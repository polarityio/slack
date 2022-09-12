const { flatMap, size } = require('lodash/fp');
const { getStateValueByPath } = require('../pseudoStateManager');
const publishBlocksToUserHomeScreen = require('./publishBlocksToUserHomeScreen');
const {
  buildHomePagePolarityCredentialsBlocks,
  buildHomePageIntegrationBlocks
} = require('../appHome/blockBuilders');

const publishHomePageWithState = async (slackUserId) => {
  const { integrationSubscriptions, userPolarityCredentials } = getStateValueByPath(
    `${slackUserId}.slackAppHomeState`
  ) || {};
  
  const appHomePageBlocks = [
    ...buildHomePagePolarityCredentialsBlocks(userPolarityCredentials),
    ...(size(integrationSubscriptions) &&
    userPolarityCredentials.loggedIntoPolarity
      ? [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'Integrations:',
              emoji: true
            }
          },
          ...flatMap(buildHomePageIntegrationBlocks, integrationSubscriptions)
        ]
      : [])
  ];

  await publishBlocksToUserHomeScreen(slackUserId, appHomePageBlocks);
};

module.exports = publishHomePageWithState;
