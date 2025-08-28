/*
 * Copyright (c) 2025, Polarity.io, Inc.
 */

const {
  logging: { getLogger },
  errors: { parseErrorToReadableJson }
} = require('polarity-integration-utils');
const { IntegrationError } = require('./errors');

const retryDoLookup = async ({ entity }, options) => {
  const { doLookup } = require('../integration');
  const Logger = getLogger();

  Logger.trace(
    { entityValue: entity.value, doLookupType: typeof doLookup },
    'Retrying doLookup'
  );
  return new Promise((resolve, reject) => {
    // Force the search to happen without a prompt because this is the manually triggered search
    options.promptBeforeSearching = false;
    doLookup([entity], options, (err, lookupResults) => {
      if (err) {
        Logger.trace({err}, 'Error in retryDoLookup');
        return reject(
          new IntegrationError('RetryDoLookup Failed', {
            cause: err
          })
        );
      }
      if (lookupResults.length > 0) {
        return resolve(lookupResults[0]);
      } else {
        Logger.error({ lookupResults }, 'Unexpected lookup results when retrying search');
        return reject(
          new IntegrationError('Unexpected lookupResults returned', {
            lookupResults
          })
        );
      }
    });
  });
};

module.exports = retryDoLookup;
