const {
  logging: { getLogger },
  errors: { parseErrorToReadableJson }
} = require('polarity-integration-utils');

const { requestWithDefaults } = require('./request');

const sendMessage = async ({ text, channel }, options, callback) => {
  const Logger = getLogger();

  try {
    await requestWithDefaults({
      method: 'POST',
      url: `${options.url}/chat.postMessage`,
      body: {
        channel,
        text,
        username: `Polarity${
          options.messagingDisplayName ? `: ${options.messagingDisplayName}` : ''
        }`
      },
      options
    });

    callback(null, {});
  } catch (error) {
    const err = parseErrorToReadableJson(error);
    Logger.error(
      {
        detail: 'Failed to Message Channel',
        options,
        formattedError: err
      },
      'Message Channel Failed'
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

module.exports = sendMessage;
