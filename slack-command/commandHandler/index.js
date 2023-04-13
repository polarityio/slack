const { parseEntities } = require('../polarity');
const { getSlackUser } = require('../slack');
const { requestWithDefaults } = require('../request');
const { getStateValueByPath } = require('../localStateManager');

const getIntegrationSearchResultsSummaryTagsBlocks = require('./getIntegrationSearchResultsSummaryTagsBlocks');
const displayNoSearchStringMessage = require('./displayNoSearchStringMessage');
const displayLoginInfoMessage = require('./displayLoginInfoMessage');
const { buildFullCommandResultBlocks } = require('./blockBuilders');
const { truncateBlocks } = require('../../src/dataTransformations');

const handleSlackCommand = async (slackUserId, searchText, responseUrl) => {
  if (!searchText) return await displayNoSearchStringMessage(responseUrl);

  const notLoggedIntoPolarity = !getStateValueByPath(
    'serviceAccountCredentials.polarityCookie'
  );
  if (notLoggedIntoPolarity) return await displayLoginInfoMessage(responseUrl);

  const [{ profilePicture, slackUserName }, entities] = await Promise.all([
    getSlackUser(slackUserId),
    parseEntities(slackUserId, searchText)
  ]);

  const integrationsSearchResultsSummaryTags =
    await getIntegrationSearchResultsSummaryTagsBlocks(slackUserId, searchText, entities);

  const commandResultBlocks = buildFullCommandResultBlocks(
    profilePicture,
    slackUserName,
    searchText,
    integrationsSearchResultsSummaryTags
  );

  const only100CommandBlocksOrLess = truncateBlocks(
    commandResultBlocks,
    '\n:grey_exclamation: Maximum Results Displayed...\n'
  );
  
  await requestWithDefaults({
    method: 'POST',
    site: 'slack',
    url: responseUrl,
    headers: { 'Content-type': 'application/json' },
    body: {
      response_type: 'in_channel',
      replace_original: true,
      blocks: only100CommandBlocksOrLess
    }
  });
};

module.exports = handleSlackCommand;
