const { flow, map, get, size, find, every, eq } = require('lodash/fp');
const {
  logging: { getLogger }
} = require('polarity-integration-utils');

const createLookupResults = (
  entitiesPartition,
  channelsToSendTo,
  foundMessagesByEntity,
  options
) =>
  map((entity) => {
    const Logger = getLogger();
    const {
      foundMessagesFromSearch,
      totalNumberOfSearchResultPages,
      currentSearchResultsPage
    } = find(flow(get('entity.value'), eq(entity.value)), foundMessagesByEntity) || {
      foundMessagesFromSearch: [],
      totalNumberOfSearchResultPages: 0,
      currentSearchResultsPage: 0
    };

    Logger.info({ foundMessagesFromSearch, options }, 'createLookupResults');

    const lookupResult = {
      entity,
      data:
        size(foundMessagesFromSearch) ||
        (options.allowSendingMessages && every(size, [channelsToSendTo]))
          ? {
              summary: []
                .concat(options.allowSendingMessages && size(channelsToSendTo) ? 'Message Channels' : [])
                .concat(size(foundMessagesFromSearch) ? 'Search Results' : []),
              details: {
                channelsToSendTo,
                foundMessagesFromSearch,
                totalNumberOfSearchResultPages,
                currentSearchResultsPage
              }
            }
          : null
    };

    return lookupResult;
  }, entitiesPartition);

module.exports = createLookupResults;
