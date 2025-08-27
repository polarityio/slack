'use strict';

const {
  logging: { setLogger, getLogger },
  errors: { parseErrorToReadableJson }
} = require('polarity-integration-utils');

const validateOptions = require('./src/validateOptions');

const getLookupResults = require('./src/getLookupResults');

const sendMessage = require('./src/sendMessage');
const loadMoreSearchMessages = require('./src/loadMoreSearchMessages');
const getUserAvatars = require('./src/getUserAvatars');

async function doLookup(entities, options, cb) {
  const Logger = getLogger();

  let lookupResults;
  try {
    Logger.debug({ entities }, 'Entities');
    options.url = options.url.endsWith('/') ? options.url.slice(0, -1) : options.url;
    options.maxConcurrent = 1;
    options.minimumMillisecondsRequestWillTake = 200;

    lookupResults = await getLookupResults(entities, options);
  } catch (error) {
    const err = parseErrorToReadableJson(error);
    Logger.error({ error, formattedError: err }, 'Get Lookup Results Failed');

    return cb({ detail: error.message || 'Command Failed', err });
  }

  Logger.trace({ lookupResults }, 'Lookup Results');
  cb(null, lookupResults);
}

const getOnMessage = { sendMessage, loadMoreSearchMessages, getUserAvatars };

async function onMessage({ action, data: actionParams }, options, callback) {
  const Logger = getLogger();

  try {
    const result = await getOnMessage[action](actionParams, options);
    callback(null, result);
  } catch (error) {
    const err = parseErrorToReadableJson(error);
    Logger.error(
      {
        detail: `onMessage action ${action} failed`,
        options: {
          ...options,
          userToken: '*********',
          botToken: '*********'
        },
        formattedError: err
      },
      `onMessage action ${action} failed`
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
}

module.exports = {
  startup: setLogger,
  validateOptions,
  doLookup,
  onMessage
};
