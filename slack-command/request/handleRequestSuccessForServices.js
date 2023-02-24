const { get, eq, flow } = require('lodash/fp');

const { getStateValueByPath, setStateValueForPath } = require('../localStateManager');

const { getSetCookies, encrypt } = require('../../src/dataTransformations');

const handleRequestSuccessForServices =
  (requestWithDefaultsBuilder) => async (result, requestOptions) =>
    await get(requestOptions.site, processSuccessBySite)(
      result,
      requestOptions,
      requestWithDefaultsBuilder
    );

const refreshCookie = async (result) => {
  if (flow(get('statusCode'), eq(200))(result)) {
    const newPolarityCookie = encrypt(
      getSetCookies(get('headers', result)),
      getStateValueByPath('config.slackSigningSecret')
    );
    setStateValueForPath('serviceAccountCredentials.polarityCookie', newPolarityCookie);
  }
  return result;
};

const processSuccessBySite = {
  polarity: refreshCookie,
  slack: (result) => result
};

module.exports = handleRequestSuccessForServices;
