const {
  logging: { getLogger },
  errors: { parseErrorToReadableJson }
} = require('polarity-integration-utils');
const searchMessages = require('./searchMessages');

const loadMoreSearchMessages = async (
  { entity, channels, currentSearchResultsPage },
  options,
  callback
) => {
  const Logger = getLogger();

  try {
    const [
      {
        foundMessagesFromSearch,
        totalNumberOfSearchResultPages,
        currentSearchResultsPage: _currentSearchResultsPage
      }
    ] = await searchMessages(
      [entity],
      channels,
      options,
      currentSearchResultsPage + 1
    );

    return callback(null, {
      foundMessagesFromSearch,
      currentSearchResultsPage: _currentSearchResultsPage,
      totalNumberOfSearchResultPages
    });
  } catch (error) {
    const err = parseErrorToReadableJson(error);
    Logger.error(
      {
        detail: 'Failed to Load More Messages',
        options,
        formattedError: err
      },
      'Load More Messages Failed'
    );

    const { message, detail, status } = err;

    return callback({
      errors: [
        {
          err,
          detail: `${message}${detail ? ` - ${detail}` : ''}${
            status ? `, Code: ${status}` : ''
          }`
        }
      ]
    });
  }
};

module.exports = loadMoreSearchMessages;
