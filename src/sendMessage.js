const {
  logging: { getLogger },
  errors: { parseErrorToReadableJson }
} = require('polarity-integration-utils');

const { requestWithDefaults } = require('./request');

const sendMessage = async ({ text, channel }, options) => {
  const Logger = getLogger();
  
  return await requestWithDefaults({
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
};

module.exports = sendMessage;
