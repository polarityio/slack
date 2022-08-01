const { map, flow, first, split, last, trim } = require('lodash/fp');

const { splitOutIgnoredIps } = require('./dataTransformations');
const createLookupResults = require('./createLookupResults');
const getSlackChannels = require('./getSlackChannels');
const searchMessages = require('./searchMessages');

const getLookupResults = async (entities, options, requestWithDefaults, Logger) => {
  const entitiesWithCustomTypesSpecified = map(
    ({ type, types, ...entity }) => ({
      ...entity,
      type: type === 'custom' ? flow(first, split('.'), last)(types) : type
    }),
    entities
  );

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
    : []

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
