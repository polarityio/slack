const Parselarity = require('../polarity/parselarityjs/parselarity');
const { getSlackUser } = require('../slack');
const { requestWithDefaults } = require('../request');
const { getStateValueByPath } = require('../localStateManager');

const getIntegrationSearchResultsSummaryTagsBlocks = require('./getIntegrationSearchResultsSummaryTagsBlocks');
const buildFullCommandResultBlocks = require('./buildFullCommandResultBlocks');
const displayLoginInfoMessage = require('./displayLoginInfoMessage');

const handleSlackCommand = async (slackUserId, searchText, responseUrl) => {
  const notLoggedIntoPolarity = !getStateValueByPath(
    `${slackUserId}.slackAppHomeState.userPolarityCredentials.loggedIntoPolarity`
  );
  if (notLoggedIntoPolarity) return await displayLoginInfoMessage(responseUrl);

  const entities = Parselarity.parse(searchText);

  const { profilePicture, slackUserName } = await getSlackUser(slackUserId);

  const integrationsSearchResultsSummaryTags =
    await getIntegrationSearchResultsSummaryTagsBlocks(slackUserId, entities);

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
