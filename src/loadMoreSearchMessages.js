const {
  logging: { getLogger },
  errors: { parseErrorToReadableJson }
} = require('polarity-integration-utils');
const searchMessages = require('./searchMessages');

const loadMoreSearchMessages = async ({ entity, currentSearchResultsPage }, options) => {
  const Logger = getLogger();

  const [
    {
      foundMessagesFromSearch,
      totalNumberOfSearchResultPages,
      currentSearchResultsPage: _currentSearchResultsPage,
      totalCount,
      apiLimitReached
    }
  ] = await searchMessages([entity], options, currentSearchResultsPage + 1);

  Logger.trace(
    {
      foundMessagesFromSearch,
      entityValue: entity.value,
      currentSearchResultsPage,
      totalCount,
      apiLimitReached
    },
    'loadMoreSearchMessages'
  );

  return {
    foundMessagesFromSearch,
    currentSearchResultsPage: _currentSearchResultsPage,
    totalNumberOfSearchResultPages,
    totalCount,
    apiLimitReached
  };
};

module.exports = loadMoreSearchMessages;
