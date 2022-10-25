const fs = require('fs');
const {
  get,
  set,
  includes,
  flow,
  split,
  last,
  filter,
  concat,
  join,
  negate,
  reverse
} = require('lodash/fp');

const LOCAL_STATE_FILEPATH = './state.json';
const ENV_VAR_FILEPATH = './slack-command/.env';
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
    setEnvVarInFile(get(flow(split('.'), last)(path), configEnvVarMapping), newValue);
    return;
  }
  const localState = _getLocalState(LOCAL_STATE_FILEPATH);

  const newLocalState = set(path, newValue, localState);

  fs.writeFileSync(LOCAL_STATE_FILEPATH, JSON.stringify(newLocalState));

  return newLocalState;
};

const _getLocalState = (path = LOCAL_STATE_FILEPATH) =>
  fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf8')) : {};


const getConfigEnvironmentVariables = () => {
  const environment = require('dotenv').config({ path: ENV_VAR_FILEPATH }).parsed;

  return{
  //https://api.slack.com/authentication/config-tokens
  slackBotToken: environment.POLARITY_SLACK_APP_BOT_TOKEN,
  appToken: environment.POLARITY_SLACK_APP_TOKEN,
  appRefreshToken: environment.POLARITY_SLACK_APP_REFRESH_TOKEN,
  slackSigningSecret: environment.POLARITY_SLACK_APP_SIGNING_SECRET,
}};

const configEnvVarMapping = {
  slackBotToken: "POLARITY_SLACK_APP_BOT_TOKEN",
  appToken: "POLARITY_SLACK_APP_TOKEN",
  appRefreshToken: "POLARITY_SLACK_APP_REFRESH_TOKEN"
};

const setEnvVarInFile = (key,value) => {
  const envFileContent = fs.readFileSync(ENV_VAR_FILEPATH, 'utf8');
  const newEnvVars = flow(
    split('\n'),
    filter(negate(includes(key))),
    concat(`${key}="${value}"`),
    reverse,
    join('\n')
  )(envFileContent);
  fs.writeFileSync(ENV_VAR_FILEPATH, newEnvVars);
}

/** Current State Schema
{
  "<slackUserId>": {
    "slackAppHomeState": {
      "userPolarityCredentials": {
        "showPasswordField": false,
        "hidePolarityCredentials": false,
        "polarityUsername": "<username>", // username and password are removed from state when they enable the user to obtain a polarityCookie
        "polarityCookie": "<polarity-cookie>" // removes username and password when this property is set in state
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
