const { get, flow, filter, map } = require('lodash/fp');
const searchIntegrationById = require('../polarity/searchIntegrationById');

const getIntegrationsSearchResults = async (
  slackUserId,
  entities,
  integrationSubscriptions
) =>
  await Promise.all(
    flow(
      getIntegrationIdsToSearch,
      map(async (intId) => await searchIntegrationById(slackUserId, intId, entities)),
    )(integrationSubscriptions)
  );

const getIntegrationIdsToSearch = flow(
  filter(get('includeInSearch')),
  map(get('integration.id'))
);

module.exports = getIntegrationsSearchResults;
