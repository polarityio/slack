const {
  map,
  get,
  getOr,
  filter,
  flow,
  negate,
  isEmpty,
  tail,
  first,
  some,
  includes,
  __,
  eq
} = require('lodash/fp');
const { parallelLimit } = require('async');

const {
  requests: { createRequestWithDefaults },
  logging: { getLogger },
  errors: { parseErrorToReadableJson }
} = require('polarity-integration-utils');

const { ERROR_MESSAGES } = require('./constants');

const config = require('../config/config');
const { sleep } = require('./dataTransformations');

const USER_TOKEN_ROUTE_INCLUDES = ['search.messages'];

const requestWithDefaults = createRequestWithDefaults({
  config,
  roundedSuccessStatusCodes: [200],
  requestOptionsToOmitFromLogsKeyPaths: ['headers.Authorization'],
  useLimiter: true,
  preprocessRequestOptions: async ({ options, ...requestOptions }) => ({
    ...requestOptions,
    headers: {
      ...requestOptions.headers,
      Authorization: `Bearer ${
        some(includes(__, requestOptions.url), USER_TOKEN_ROUTE_INCLUDES)
          ? options.userToken
          : options.botToken
      }`
    },
    json: true
  }),
  postprocessRequestResponse: async (response) => {
    const requestIsNotOk = !get('body.ok', response);

    if (requestIsNotOk || response.statusCode >= 400) {
      const requestError = Error('Request Error');
      requestError.status = response.statusCode;
      requestError.description = JSON.stringify(response.body);
      requestError.headers = JSON.stringify(response.headers);

      throw requestError;
    }

    return response;
  },
  postprocessRequestFailure: async (error, requestOptions) => {
    try {
      const errorResponseBody = JSON.parse(error.description);

      if (error.status === 429 || errorResponseBody.error === 'ratelimited') {
        return await handleRetryAfterExceededRateLimit(error, requestOptions);
      }
      error.message = `${error.message} ${error.status ? `- (${error.status}) ` : ''}${
        errorResponseBody.message || errorResponseBody.error
          ? `| ${
              get(errorResponseBody.error, ERROR_MESSAGES) ||
              errorResponseBody.message ||
              errorResponseBody.error
            }`
          : ''
      }`;
    } catch (_) {}

    throw error;
  }
});

const handleRetryAfterExceededRateLimit = async (error, requestOptions) => {
  if (requestOptions.accSleepTime > 14000) {
    error.message =
      `Rate Limit Exceeded (${error.status}) - You might have too many Slack Channels or too many messages in the channels. ` +
      `Please try again, but if this persists please reduce the channels your credentials have access to search in the Slack Credentials dashboard.`;

    throw error;
  }
  const headers = JSON.parse(error.headers);
  const millisecondsToWait =
    parseInt(headers['retry-after'] || headers['Retry-After'] || 7.6, 10) * 1000;

  await sleep(millisecondsToWait);

  return await requestWithDefaults({
    ...requestOptions,
    accSleepTime: (requestOptions.accSleepTime || 0) + millisecondsToWait
  });
};

const createRequestsInParallel =
  (requestWithDefaults) =>
  async (
    requestsOptions,
    responseGetPath,
    limit = 10,
    onlyReturnPopulatedResults = true
  ) => {
    const unexecutedRequestFunctions = map(
      ({ resultId, ...requestOptions }) =>
        async () => {
          const response = await requestWithDefaults(requestOptions);
          const result = responseGetPath ? get(responseGetPath, response) : response;
          return resultId ? { resultId, result } : result;
        },
      requestsOptions
    );

    const firstResult = await first(unexecutedRequestFunctions)();
    const remainingResults = await parallelLimit(tail(unexecutedRequestFunctions), limit);
    const results = [firstResult, ...remainingResults];

    return onlyReturnPopulatedResults
      ? filter(
          flow((result) => getOr(result, 'result', result), negate(isEmpty)),
          results
        )
      : results;
  };

const requestsInParallel = createRequestsInParallel(requestWithDefaults);

module.exports = {
  requestWithDefaults,
  requestsInParallel
};
