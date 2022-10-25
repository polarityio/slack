const { get, getOr, includes, identity, stubFalse, eq, flow, negate } = require('lodash/fp');

const { getSetCookies, or } = require('../../src/dataTransformations');
const { getStateValueByPath, setStateValueForPath } = require('../localStateManager');
const handleRequestErrorsForServices = require('./handleRequestErrorsForServices');

const authenticateRequest =
  (requestWithDefaultsBuilder) =>
  async ({ site, ...requestOptions }) =>
    await getOr(identity,site, authenticationProcessBySite)(
      requestOptions,
      requestWithDefaultsBuilder
    );

const authenticateForPolarityRequest = async (
  { route, slackUserId, polarityPassword, ...requestOptions },
  requestWithDefaultsBuilder
) => {
  const requestWithDefaults = requestWithDefaultsBuilder(
    stubFalse,
    identity,
    handleRequestErrorsForServices(requestWithDefaultsBuilder)
  );

  const polarityUrl = getStateValueByPath('config.polarityUrl');

  const polarityCredentialsPath = `${slackUserId}.slackAppHomeState.userPolarityCredentials`;
  let { polarityCookie, polarityUsername } =
    getStateValueByPath(polarityCredentialsPath) || {};

  if (!polarityCookie && polarityUsername && polarityPassword) {
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

    const credentialsAreIncorrect = flow(
      get('statusCode'),
      or(eq(401), eq(422), negate(identity))
    )(authenticationResponse);

    polarityCookie = getSetCookies(get('headers', authenticationResponse));
    if (!credentialsAreIncorrect && polarityCookie) {
      setStateValueForPath(`${polarityCredentialsPath}.polarityCookie`, polarityCookie);
      setStateValueForPath(`${polarityCredentialsPath}.polarityUsername`, '');
    } else {
      setStateValueForPath(`${polarityCredentialsPath}.polarityCookie`, '');
    }
  }
  
  return {
    ...requestOptions,
    url: `${polarityUrl}/${route}`,
    headers: {
      ...requestOptions.headers,
      Cookie: polarityCookie
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
