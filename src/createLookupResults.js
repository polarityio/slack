const {
  flow,
  map,
  get,
  reduce,
  mapValues,
  some,
  size,
  identity,
  find,
  __,
  filter,
  compact,
  uniq,
  join,
  capitalize,
  omit,
  values,
  snakeCase,
  keys,
  assign,
  every
} = require('lodash/fp');

const constants = require('./constants');

const createLookupResults = (entitiesPartition, channels, options, Logger) =>
  map((entity) => {
    //...entitySpecificQueryResults }) => {
    // const formattedQueryResults = formatQueryResult(
    //   entitySpecificQueryResults,
    //   options,
    //   Logger
    // );

    const lookupResult = {
      entity,
      data:
        every(size, [channels, options.messagingChannelNames]) &&
        options.allowSendingMessages
          ? {
              summary: ['Message Channels'],
              // summary: createSummary(
              //   entitySpecificQueryResults,
              //   formattedQueryResults,
              //   Logger
              // ),
              details: { channels }
              // details: flow(omit(['entity']), keys, (keys) =>
              //   assign(formattedQueryResults, { tabKeys: keys, channels })
              // )(entitySpecificQueryResults)
            }
          : null
    };

    return lookupResult;
  }, entitiesPartition);

// const createSummary = (unformattedQueryResults, formattedQueryResult, Logger) => {
//   return [];
// };

// const formatQueryResult = (entitySpecificQueryResults, options, Logger) => {
//   const noQueryResultHasContent = !flow(
//     omit(['entity']),
//     values,
//     some(size)
//   )(entitySpecificQueryResults);
//   if (noQueryResultHasContent) return;

//   return {
//     //TODO: add formatted query results
//   };
// };

module.exports = createLookupResults;
