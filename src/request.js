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
const { RetryRequestError, ApiRequestError } = require('./errors');
const {
  requests: { createRequestWithDefaults },
  logging: { getLogger },
  errors: { parseErrorToReadableJson }
} = require('polarity-integration-utils');
const { ERROR_MESSAGES } = require('./constants');
const config = require('../config/config');


const USER_TOKEN_ROUTE_INCLUDES = ['search.messages'];

// Workaround required because v1 of the utils library is expecting a request object
// on the config
config.request = {
  cert: '',
  key: '',
  passphrase: '',
  ca: '',
  proxy: ''
};

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
    const Logger = getLogger();
    const requestIsNotOk = !get('body.ok', response);

    //response.statusCode = 429;
    // if (requestIsNotOk || response.statusCode >= 400) {
    //   throw new ApiRequestError('Request Error', {
    //     statusCode: response.statusCode,
    //     body: response.body,
    //     headers: response.headers
    //   });
    // }
    
    Logger.trace({response}, 'Post Process Request Response');

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
    const errorResponseBody = JSON.parse(error.description);
    
    if (error.status === 429 && requestOptions.retryOnLimit) {
      throw new RetryRequestError('ratelimited', {
        cause: error,
        requestOptions
      });
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
    
    let requestOptionsSanitized = {
      ...requestOptions
    }
    
    delete requestOptionsSanitized.options;

    throw new ApiRequestError('Request Error', {
      cause: error,
      requestOptions: requestOptionsSanitized
    });
  }
});

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
