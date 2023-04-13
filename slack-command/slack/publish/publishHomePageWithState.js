const { size } = require('lodash/fp');
const { getStateValueByPath } = require('../../localStateManager');
const publishBlocksToUserHomeScreen = require('./publishBlocksToUserHomeScreen');
const {
  assembleAppHomePageBlocks,
  assembleMinimizedAppHomePageBlocks
} = require('../../appHome/blockBuilders');
const checkIfUserIsAdmin = require('../checkIfUserIsAdmin');

const publishHomePageWithState = async (slackUserId, polarityPassword = '') => {
  const userIsAdmin = await checkIfUserIsAdmin(slackUserId);

  const { integrationSubscriptions } =
    getStateValueByPath(`${slackUserId}.slackAppHomeState`) || {};

  const serviceAccountCredentials = getStateValueByPath('serviceAccountCredentials');

  let appHomePageBlocks = assembleAppHomePageBlocks(
    userIsAdmin,
    serviceAccountCredentials,
    polarityPassword,
    integrationSubscriptions
  );

  if (size(appHomePageBlocks) > 100) {
    appHomePageBlocks = assembleMinimizedAppHomePageBlocks(
      userIsAdmin,
      serviceAccountCredentials,
      polarityPassword,
      integrationSubscriptions
    );
  }

  await publishBlocksToUserHomeScreen(slackUserId, appHomePageBlocks);
};


module.exports = publishHomePageWithState;
