'use strict';

const {
  logging: { setLogger, getLogger },
  errors: { parseErrorToReadableJson }
} = require('polarity-integration-utils');

const validateOptions = require('./src/validateOptions');

const getLookupResults = require('./src/getLookupResults');

const sendMessage = require('./src/sendMessage');
const loadMoreSearchMessages = require('./src/loadMoreSearchMessages');

const doLookup = async (entities, options, cb) => {
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
};

const getOnMessage = { sendMessage, loadMoreSearchMessages };

const onMessage = ({ action, data: actionParams }, options, callback) =>
  getOnMessage[action](actionParams, options, callback);



module.exports = {
  startup: setLogger,
  validateOptions,
  doLookup,
  onMessage
};
