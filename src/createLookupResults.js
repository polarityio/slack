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
      currentSearchResultsPage,
      apiLimitReached
    } = find(flow(get('entity.value'), eq(entity.value)), foundMessagesByEntity) || {
      foundMessagesFromSearch: [],
      totalNumberOfSearchResultPages: 0,
      currentSearchResultsPage: 0
    };

    if (options.promptBeforeSearching) {
      return {
        entity,
        data: {
          summary: ['Run Slack Search'],
          details: {
            channelsToSendTo,
            promptBeforeSearching: true,
            searchPermissions: options.searchPermissions.value,
            searchChannels: options.slackChannelsToSearch
              .split(',')
              .map((channel) => channel.trim())
              .filter((channel) => !!channel)
          }
        }
      };
    }

    if (apiLimitReached) {
      return {
        entity,
        data: {
          summary: ['API Limit Reached'],
          details: {
            channelsToSendTo,
            apiLimitReached: true
          }
        }
      };
    }

    const lookupResult = {
      entity,
      data:
        size(foundMessagesFromSearch) ||
        (options.allowSendingMessages && every(size, [channelsToSendTo]))
          ? {
              summary: []
                .concat(
                  options.allowSendingMessages && size(channelsToSendTo)
                    ? 'Message Channels'
                    : []
                )
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
