const { map, flow, first, split, last, trim, filter, get, size, negate, isEqual, some, toLower, eq, uniqBy } = require('lodash/fp');

const { splitOutIgnoredIps } = require('./dataTransformations');
const createLookupResults = require('./createLookupResults');
const getSlackChannels = require('./getSlackChannels');
const searchMessages = require('./searchMessages');

const getLookupResults = async (entities, options, requestWithDefaults, Logger) => {
  const entitiesWithCustomTypesSpecified = map(({ type, types, value, ...entity }) => {
    type = type === 'custom' ? flow(first, split('.'), last)(types) : type;

    return {
      ...entity,
      type,
      value: type === 'manualSlackSearch' ? flow(split(':'), last, trim)(value) : value
    };
  }, entities);

  const { entitiesPartition, ignoredIpLookupResults } = splitOutIgnoredIps(
    entitiesWithCustomTypesSpecified
  );

  const channels = await getSlackChannels(options, requestWithDefaults, Logger);

  const foundMessagesByEntity = options.allowSearchingMessages
    ? await searchMessages(
        entitiesPartition,
        channels,
        options,
        requestWithDefaults,
        Logger
      )
    : [];

  const lookupResults = createLookupResults(
    entitiesPartition,
    channels,
    foundMessagesByEntity,
    options,
    Logger
  );

  return lookupResults.concat(ignoredIpLookupResults);
};

module.exports = getLookupResults;
