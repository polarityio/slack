const { parseEntities } = require('../polarity');
const { getSlackUser } = require('../slack');
const { requestWithDefaults } = require('../request');
const { getStateValueByPath } = require('../localStateManager');

const getIntegrationSearchResultsSummaryTagsBlocks = require('./getIntegrationSearchResultsSummaryTagsBlocks');
const buildFullCommandResultBlocks = require('./buildFullCommandResultBlocks');
const displayLoginInfoMessage = require('./displayLoginInfoMessage');

const handleSlackCommand = async (slackUserId, searchText, responseUrl) => {
  const notLoggedIntoPolarity = !getStateValueByPath(
    `${slackUserId}.slackAppHomeState.userPolarityCredentials.polarityCookie`
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

  await requestWithDefaults({
    method: 'POST',
    site: 'slack',
    url: responseUrl,
    headers: { 'Content-type': 'application/json' },
    body: {
      response_type: 'in_channel',
      replace_original: true,
      blocks: commandResultBlocks
    }
  });
};

module.exports = handleSlackCommand;
