const { get, getOr, includes, identity, stubFalse, eq, flow } = require('lodash/fp');

const { getSetCookies, or } = require('../dataTransformations');
const { getStateValueByPath, setStateValueForPath } = require('../pseudoStateManager');

const { POLARITY_COOKIE_TIMEOUT_SECONDS } = require('../constants');

const NodeCache = require('node-cache');
const handleRequestErrorsForServices = require('./handleRequestErrorsForServices');
const cookieCache = new NodeCache({
  stdTTL: POLARITY_COOKIE_TIMEOUT_SECONDS
});

const authenticateRequest =
  (requestWithDefaultsBuilder) =>
  async ({ site, ...requestOptions }) =>
    await getOr(identity,site, authenticationProcessBySite)(
      requestOptions,
      requestWithDefaultsBuilder
    );

const authenticateForPolarityRequest = async (
  { route, slackUserId, ...requestOptions },
  requestWithDefaultsBuilder
) => {
  const requestWithDefaults = requestWithDefaultsBuilder(
    stubFalse,
    identity,
    handleRequestErrorsForServices(requestWithDefaultsBuilder)
  );

  const polarityUrl = getStateValueByPath('config.polarityUrl');

  const polarityCredentialsPath = `${slackUserId}.slackAppHomeState.userPolarityCredentials`;
  const { polarityUsername, polarityPassword } =
    getStateValueByPath(polarityCredentialsPath) || {};

  const polarityCookiePath = `${slackUserId}-${polarityUsername}-${polarityPassword}-authenticationCookie`;

  let credentialsAreIncorrect;
  let Cookie = cookieCache.get(polarityCookiePath);
  if (!Cookie) {
    const authenticationResponse = await requestWithDefaults({
      method: 'POST',
      site: 'polarity',
      url: `${polarityUrl}/v2/authenticate`,
      headers: { 'Content-Type': 'application/json' },
      body: {
        identification: polarityUsername,
        password: polarityPassword
      }
    });

    credentialsAreIncorrect = flow(
      get('statusCode'),
      or(eq(401), eq(422))
    )(authenticationResponse);

    Cookie = getSetCookies(get('headers', authenticationResponse));

    cookieCache.set(polarityCookiePath, Cookie);
  }

  setStateValueForPath(
    `${polarityCredentialsPath}.loggedIntoPolarity`,
    !credentialsAreIncorrect && !!Cookie
  );
  
  return {
    ...requestOptions,
    url: `${polarityUrl}/${route}`,
    headers: {
      ...requestOptions.headers,
      Cookie
    }
  };
};

const authenticateForSlackRequest = ({ route, ...requestOptions }) => ({
  url: `https://slack.com/api/${route}`,
  ...requestOptions,
  headers: {
    ...requestOptions.headers,
    Authorization: `Bearer ${getStateValueByPath(
      `config.${includes('manifest.update', route) ? 'appToken' : 'slackBotToken'}`
    )}`
  }
});

const authenticationProcessBySite = {
  polarity: authenticateForPolarityRequest,
  slack: authenticateForSlackRequest
};

module.exports = authenticateRequest;
