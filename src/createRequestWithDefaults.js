const fs = require('fs');
const request = require('postman-request');
const config = require('../config/config');

const SUCCESSFUL_ROUNDED_REQUEST_STATUS_CODES = [200];

const _configFieldIsValid = (field) => typeof field === 'string' && field.length > 0;

const createRequestWithDefaults = (Logger) => {
  const {
    request: { ca, cert, key, passphrase, rejectUnauthorized, proxy }
  } = config;

  const defaults = {
    ...(_configFieldIsValid(ca) && { ca: fs.readFileSync(ca) }),
    ...(_configFieldIsValid(cert) && { cert: fs.readFileSync(cert) }),
    ...(_configFieldIsValid(key) && { key: fs.readFileSync(key) }),
    ...(_configFieldIsValid(passphrase) && { passphrase }),
    ...(_configFieldIsValid(proxy) && { proxy }),
    ...(typeof rejectUnauthorized === 'boolean' && { rejectUnauthorized }),
    //TODO: check if should be true
    json: true
  };

  const requestWithDefaults = (
    preRequestFunction = async () => ({}),
    postRequestSuccessFunction = async (x) => x,
    postRequestFailureFunction = async (e) => {
      throw e;
    }
  ) => {
    const defaultsRequest = request.defaults(defaults);

    const _requestWithDefault = (requestOptions) =>
      new Promise((resolve, reject) => {
        defaultsRequest(requestOptions, (err, res, body) => {
          if (err) return reject(err);
          resolve({ ...res, body });
        });
      });

    return async (requestOptions) => {
      const preRequestFunctionResults = await preRequestFunction(requestOptions);
      const _requestOptions = {
        ...requestOptions,
        ...preRequestFunctionResults
      };

      let postRequestFunctionResults;
      try {
        const result = await _requestWithDefault(_requestOptions);
        checkForStatusError(result, _requestOptions);

        postRequestFunctionResults = await postRequestSuccessFunction(
          result,
          _requestOptions
        );
      } catch (error) {
        postRequestFunctionResults = await postRequestFailureFunction(
          error,
          _requestOptions
        );
      }
      return postRequestFunctionResults;
    };
  };

  const handleAuth = async ({ options, ...requestOptions }) => ({
    ...requestOptions,
    //TODO: add auth
  });

  const checkForStatusError = ({ statusCode, body }, requestOptions) => {
    const requestOptionsWithoutSensitiveData = {
      //TODO: remove sensitive data
      ...requestOptions,
      auth: '************',
      options: '************'
    };

    Logger.trace({
      MESSAGE: 'checkForStatusError',
      statusCode,
      requestOptions: requestOptionsWithoutSensitiveData,
      body
    });

    const roundedStatus = Math.round(statusCode / 100) * 100;
    if (!SUCCESSFUL_ROUNDED_REQUEST_STATUS_CODES.includes(roundedStatus)) {
      const requestError = Error('Request Error');
      requestError.status = statusCode;
      requestError.description = JSON.stringify(body);
      requestError.requestOptions = JSON.stringify(requestOptionsWithoutSensitiveData);
      throw requestError;
    }
  };

  const requestDefaultsWithInterceptors = requestWithDefaults(handleAuth);

  return requestDefaultsWithInterceptors;
};

module.exports = createRequestWithDefaults;
