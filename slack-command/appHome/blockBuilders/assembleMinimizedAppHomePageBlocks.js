const { truncateBlocks } = require('../../../src/dataTransformations');
const assembleAppHomePageBlocks = require('./assembleAppHomePageBlocks');

const assembleMinimizedAppHomePageBlocks = (
  userIsAdmin,
  serviceAccountCredentials,
  polarityPassword,
  integrationSubscriptions
) => {
  const minimizedAppHomePageBlocks = assembleAppHomePageBlocks(
    userIsAdmin,
    serviceAccountCredentials,
    polarityPassword,
    integrationSubscriptions,
    true
  );

  const only100BlocksWithPossibleMessage = truncateBlocks(
    minimizedAppHomePageBlocks,
    '\n:exclamation: Maximum Supported Integrations\n' +
      ">   _If you encounter this and would like to support all of your Polarity Server's integrations,_\n" +
      '>   _Contact us at support@polarity.io so we know to add it in our next release!_'
  );

  return only100BlocksWithPossibleMessage;
};


module.exports = assembleMinimizedAppHomePageBlocks;
