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
const retryDoLookup = require('./src/retryDoLookup');

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
    Logger.error({ error }, 'Get Lookup Results Failed');
    const cause = getLowestMetaCause(error);

    return cb(cause);
  }

  Logger.trace({ lookupResults }, 'Lookup Results');
  cb(null, lookupResults);
}

const getOnMessage = {
  sendMessage,
  loadMoreSearchMessages,
  getUserAvatars,
  retryDoLookup
};

async function onMessage({ action, data: actionParams }, options, callback) {
  const Logger = getLogger();

  try {
    const result = await getOnMessage[action](actionParams, options);
    Logger.trace({ result }, 'onMessage result');
    callback(null, result);
  } catch (error) {
    Logger.error(
      {
        detail: `onMessage action ${action} failed`,
        options: {
          ...options,
          userToken: '*********',
          botToken: '*********'
        },
        formattedError: error
      },
      `onMessage action ${action} failed`
    );
    
    const cause = getLowestMetaCause(error);
    return callback(cause);
  }
}

/**
 * Find the lowest-level `cause` that appears under a `meta` property.
 * It searches all branches for `obj.meta.cause` chains and returns the deepest one.
 *
 * @param {object} root - The JSON error payload.
 * @returns {object|null} - The deepest cause object found, or null if none exists.
 */
function getLowestMetaCause(root) {
  function dfs(node, depth = 0) {
    if (!node || typeof node !== 'object') return { cause: null, depth: -1 };

    let best = { cause: null, depth: -1 };

    // If this node has `meta.cause`, dive down that chain preferentially
    if (
      node.meta &&
      typeof node.meta === 'object' &&
      node.meta.cause &&
      typeof node.meta.cause === 'object'
    ) {
      // Explore deeper along this meta->cause chain
      const deeper = dfs(node.meta.cause, depth + 1);
      const candidate = deeper.cause ? deeper : { cause: node.meta.cause, depth: depth + 1 };
      if (candidate.depth > best.depth) best = candidate;
    }

    // Also explore other nested objects for additional meta->cause chains
    for (const key of Object.keys(node)) {
      const val = node[key];
      if (val && typeof val === 'object') {
        const found = dfs(val, depth);
        if (found.depth > best.depth) best = found;
      }
    }

    return best;
  }

  const result = dfs(root);
  return result.cause || null;
}

module.exports = {
  startup: setLogger,
  validateOptions,
  doLookup,
  onMessage
};
