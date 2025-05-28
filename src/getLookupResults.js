const {
  map,
  flow,
  first,
  split,
  last,
  trim,
  filter,
  get,
  getOr,
  size,
  negate,
  isEqual,
  some,
  toLower,
  eq,
  uniqBy
} = require('lodash/fp');

const { splitOutIgnoredIps } = require('./dataTransformations');
const createLookupResults = require('./createLookupResults');
const getSlackChannels = require('./getSlackChannels');
const searchMessages = require('./searchMessages');

const getLookupResults = async (entities, options) => {
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

  const filteredEntities = filterOutInvalidEntities(entitiesPartition, options);
  const channels = await getSlackChannels(options);

  const foundMessagesByEntity = options.allowSearchingMessages
    ? await searchMessages(filteredEntities, channels, options)
    : [];

  const lookupResults = createLookupResults(
    filteredEntities,
    channels,
    foundMessagesByEntity,
    options
  );

  return lookupResults.concat(ignoredIpLookupResults);
};

const filterOutInvalidEntities = (entities, options) =>
  flow(
    filter((entity) => {
      const trimmedEntityValue = flow(get('value'), trim)(entity);

      const isNotWhitespace = size(trimmedEntityValue);

      return isNotWhitespace;
    }),
    uniqBy(flow(get('value'), trim))
  )(entities);

module.exports = getLookupResults;
