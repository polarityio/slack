const { getStateValueByPath } = require('../localStateManager');
const getIntegrationsSearchResults = require('./getIntegrationsSearchResults');
const buildSearchResultSummaryTagBlocks = require('./buildSearchResultSummaryTagBlocks');

const getIntegrationSearchResultsSummaryTagsBlocks = async (slackUserId, entities) => {
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
    integrationSubscriptions
  );

  return integrationsSearchSummaryTagBlocks;
};

module.exports = getIntegrationSearchResultsSummaryTagsBlocks;
