const { isArray } = require('lodash');
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
  replace,
  map,
  getOr
} = require('lodash/fp');
const { and } = require('../../../src/dataTransformations');

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

const getSummaryTagBlockStrings = (integrationSearchResults, searchText) => {
  const summaryTagStrings = getAndFormatSummaryTags(integrationSearchResults);

  const markdownFormattedSummaryTagStrings = flow(
    concat(''),
    join('\n>:white_small_square: '),
    replace(
      /((http|ftp|https):\/\/)?([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])?/gi,
      (link) =>
        `<${
          require('../../../config/slack-config.js').polarityUrl
        }/search?q=${searchText}|${link}>`
    )
  )(summaryTagStrings);

  return markdownFormattedSummaryTagStrings;
};

const getAndFormatSummaryTags = (x) =>
  flow(
    get('attributes.results'),
    flatMap(
      flow(
        get('data.summary'),
        (summaryTags) =>
          !size(summaryTags) && isArray(summaryTags)
            ? ['Results returned, but no summary tags were found.']
            : summaryTags,
        map(flow((tag) => getOr(tag, 'text', tag), replace(/<[^>]*>/g, '')))
      )
    ),
    filter(and(identity, isString))
  )(x);

module.exports = buildSearchResultSummaryTagBlocks;
