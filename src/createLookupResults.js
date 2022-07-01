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
  assign
} = require('lodash/fp');

const constants = require('./constants');

const createLookupResults = (queryResults, options, Logger) =>
  map((entitySpecificQueryResults) => {
    const formattedQueryResults = formatQueryResult(
      entitySpecificQueryResults,
      options,
      Logger
    );

    const lookupResult = {
      entity: entitySpecificQueryResults.entity,
      data: !!formattedQueryResults
        ? {
            summary: createSummary(
              entitySpecificQueryResults,
              formattedQueryResults,
              Logger
            ),
            details: flow(omit(['entity']), keys, (keys) =>
              assign(formattedQueryResults, { tabKeys: keys })
            )(entitySpecificQueryResults)
          }
        : null
    };

    return lookupResult;
  }, queryResults);

const createSummary = (unformattedQueryResults, formattedQueryResult, Logger) => {
  return [];
};

const formatQueryResult = (entitySpecificQueryResults, options, Logger) => {
  const noQueryResultHasContent = !flow(
    omit(['entity']),
    values,
    some(size)
  )(entitySpecificQueryResults);
  if (noQueryResultHasContent) return;

  return {
    //TODO: add formatted query results
  };
};

module.exports = createLookupResults;
