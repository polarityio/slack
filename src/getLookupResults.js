const { map, flow, first, split, last, trim } = require('lodash/fp');

const { splitOutIgnoredIps } = require('./dataTransformations');
const createLookupResults = require('./createLookupResults');
const getSlackChannels = require('./getSlackChannels');

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

  // const queryResults = await getQueryResultsByEntity(
  //   entitiesPartition,
  //   options,
  //   requestWithDefaults,
  //   Logger
  // );

  const lookupResults = createLookupResults(entitiesPartition, channels, options, Logger);

  return lookupResults.concat(ignoredIpLookupResults);
};

// const getQueryResultsByEntity = async (
//   entitiesPartition,
//   options,
//   requestWithDefaults,
//   Logger
// ) =>
//   Promise.all(
//     map(async (entity) => {
//       const itemRecords = await queryItemRecords(entity, options, requestWithDefaults, Logger);

//       return { entity, itemRecords };
//     }, entitiesPartition)
//   );

// const queryItemRecords = async (entity, options, requestWithDefaults, Logger) => [
//   { a: 1, b: 2 }
// ];

module.exports = getLookupResults;
