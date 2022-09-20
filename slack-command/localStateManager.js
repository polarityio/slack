const fs = require('fs');
const { get, set, includes, flow, split, last } = require('lodash/fp');

const LOCAL_STATE_FILEPATH = './state.json';

const getStateValueByPath = (path) =>
  get(
    path,
    includes('config', path)
      ? {
          config: {
            ...require('../config/config.js').slackCommandServer,
            ...getConfigEnvironmentVariables()
          }
        }
      : _getLocalState()
  );

const setStateValueForPath = (path, newValue) => {
  const isConfig = includes('config', path);

  if (isConfig) {
    process.env[get(flow(split('.'), last)(path), configEnvVarMapping)] = newValue;
    return;
  }
  const localState = _getLocalState(LOCAL_STATE_FILEPATH);

  const newLocalState = set(path, newValue, localState);

  fs.writeFileSync(LOCAL_STATE_FILEPATH, JSON.stringify(newLocalState));

  return newLocalState;
};

const _getLocalState = (path = LOCAL_STATE_FILEPATH) =>
  fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf8')) : {};


const getConfigEnvironmentVariables = () => ({
  //https://api.slack.com/authentication/config-tokens
  slackBotToken: process.env.POLARITY_SLACK_APP_BOT_TOKEN,
  appToken: process.env.POLARITY_SLACK_APP_TOKEN,
  appRefreshToken: process.env.POLARITY_SLACK_APP_REFRESH_TOKEN
});

const configEnvVarMapping = {
  slackBotToken: "POLARITY_SLACK_APP_BOT_TOKEN",
  appToken: "POLARITY_SLACK_APP_TOKEN",
  appRefreshToken: "POLARITY_SLACK_APP_REFRESH_TOKEN"
};


/** Current State Schema
{
  "<slackUserId>": {
    "slackAppHomeState": {
      "userPolarityCredentials": {
        "showPasswordField": false,
        "hidePolarityCredentials": false,
        "polarityUsername": "<username>",
        "loggedIntoPolarity": true,
        "polarityPassword": "<base64EncodedPassword>"
      },
      "integrationSubscriptions": [
        {
          "integration": {
            "id": "<polarityIntegrationId>",
            "name": "<polarityIntegrationDisplayName>",
            "description": "<integrationDescription>"
          },
          "includeInSearch": false
        },
        ...
      ]
    }
  }
}
*/

module.exports = {
  setStateValueForPath,
  getStateValueByPath
};
