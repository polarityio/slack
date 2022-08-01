const { map, flow, first, split, last, trim, filter, get, size, negate, isEqual, some, toLower, eq, uniqBy } = require('lodash/fp');

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

  // const filteredEntities = filterOutInvalidEntities(entitiesPartition, options);
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

const filterOutInvalidEntities = (entities, options) =>
  flow(
    filter((entity) => {
      const trimmedEntityValue = flow(get('value'), trim)(entity);

      const isNotWhitespace = size(trimmedEntityValue);
      const isCorrectType =
        entity.type === 'custom' &&
        (!options.ignoreEntityTypes ||
          (entity.types.length === 1 &&
            !flow(
              filter(negate(isEqual(entity))),
              some(
                flow(
                  get('rawValue'),
                  trim,
                  toLower,
                  eq(flow(get('rawValue'), trim, toLower)(entity))
                )
              )
            )(entities)));

      return (
        isNotWhitespace && isCorrectType && trimmedEntityValue.length >= options.minLength
      );
    }),
    uniqBy(flow(get('value'), trim))
  )(entities);

module.exports = getLookupResults;
