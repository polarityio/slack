const {
  map,
  flow,
  first,
  split,
  last,
  trim,
  filter,
  get,
  size,
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

  let channelsToSendTo = [];
  if (options.allowSendingMessages) {
    const allChannels = await getSlackChannels(options);
    channelsToSendTo = options.messagingChannelNames
      .split(',')
      .map((channelName) =>
        allChannels.find(
          ({ name }) => name.toLowerCase() == channelName.trim().toLowerCase()
        )
      )
      .filter((x) => x);
  }

  const foundMessagesByEntity = options.allowSearchingMessages
    ? await searchMessages(filteredEntities, options)
    : [];

  const lookupResults = createLookupResults(
    filteredEntities,
    channelsToSendTo,
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
