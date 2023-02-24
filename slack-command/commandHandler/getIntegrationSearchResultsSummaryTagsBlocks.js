const { getStateValueByPath } = require('../localStateManager');
const { buildSearchResultSummaryTagBlocks } = require('./blockBuilders');
const getIntegrationsSearchResults = require('./getIntegrationsSearchResults');

const getIntegrationSearchResultsSummaryTagsBlocks = async (
  slackUserId,
  searchText,
  entities
) => {
  const integrationSubscriptions = getStateValueByPath(
    `${slackUserId}.slackAppHomeState.integrationSubscriptions`
  );

  const integrationsSearchResults = await getIntegrationsSearchResults(
    slackUserId,
    entities,
    integrationSubscriptions
  );

  const integrationsSearchSummaryTagBlocks = buildSearchResultSummaryTagBlocks(
    integrationsSearchResults,
    integrationSubscriptions,
    searchText
  );

  return integrationsSearchSummaryTagBlocks;
};

module.exports = getIntegrationSearchResultsSummaryTagsBlocks;
