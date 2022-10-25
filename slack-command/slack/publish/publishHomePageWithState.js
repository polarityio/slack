const { flatMap, size, get } = require('lodash/fp');
const { getStateValueByPath } = require('../../localStateManager');
const publishBlocksToUserHomeScreen = require('./publishBlocksToUserHomeScreen');
const {
  buildHomePagePolarityCredentialsBlocks,
  buildHomePageIntegrationBlocks
} = require('../../appHome/blockBuilders');

const publishHomePageWithState = async (slackUserId, polarityPassword = '') => {
  const { integrationSubscriptions, userPolarityCredentials } =
    getStateValueByPath(`${slackUserId}.slackAppHomeState`) || {};

  const appHomePageBlocks = [
    ...buildHomePagePolarityCredentialsBlocks({
      ...userPolarityCredentials,
      polarityPassword
    }),
    ...(size(integrationSubscriptions) && get('polarityCookie', userPolarityCredentials)
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
