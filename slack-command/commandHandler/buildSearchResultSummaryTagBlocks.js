const {
  get,
  flow,
  filter,
  concat,
  join,
  flatMap,
  find,
  eq,
  identity,
  isString,
  reduce,
  size
} = require('lodash/fp');
const { and } = require('../../src/dataTransformations');

const buildSearchResultSummaryTagBlocks = (
  integrationsSearchResults,
  integrationSubscriptions
) =>
  reduce(
    (agg, integrationSearchResults) => {
      const integrationDisplayName = getIntegrationDisplayName(
        integrationSearchResults,
        integrationSubscriptions
      );

      const summaryTagBlockStrings = getSummaryTagBlockStrings(integrationSearchResults);

      return size(summaryTagBlockStrings)
        ? agg.concat({
            type: 'mrkdwn',
            text: `*${integrationDisplayName}*     \n ${summaryTagBlockStrings}`
          })
        : agg;
    },
    [],
    integrationsSearchResults
  );

const getIntegrationDisplayName = (integrationSearchResults, integrationSubscriptions) =>
  flow(
    get('id'),
    (searchResultIntId) =>
      find(flow(get('integration.id'), eq(searchResultIntId)), integrationSubscriptions),
    get('integration.name')
  )(integrationSearchResults);

const getSummaryTagBlockStrings = (integrationSearchResults) =>
  flow(
    get('attributes.results'),
    flatMap(get('data.summary')),
    filter(and(identity, isString)),
    concat(''),
    join('\n>:white_small_square: ')
  )(integrationSearchResults);

module.exports = buildSearchResultSummaryTagBlocks;
