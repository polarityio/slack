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
  size,
  replace
} = require('lodash/fp');
const { and } = require('../../src/dataTransformations');

const buildSearchResultSummaryTagBlocks = (
  integrationsSearchResults,
  integrationSubscriptions,
  searchText
) =>
  reduce(
    (agg, integrationSearchResults) => {
      const integrationDisplayName = getIntegrationDisplayName(
        integrationSearchResults,
        integrationSubscriptions
      );

      const summaryTagBlockStrings = getSummaryTagBlockStrings(
        integrationSearchResults,
        searchText
      );

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

const getSummaryTagBlockStrings = (integrationSearchResults, searchText) =>
  flow(
    get('attributes.results'),
    flatMap(get('data.summary')),
    filter(and(identity, isString)),
    concat(''),
    join('\n>:white_small_square: '),
    replace(
      /((http|ftp|https):\/\/)?([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/gi,
      (link) =>
        `<${
          require('../../config/config.js').slackCommandServer.polarityUrl
        }/search?q=${searchText}|${link}>`
    )
  )(integrationSearchResults);

module.exports = buildSearchResultSummaryTagBlocks;
