//!NOTE: This will need to to be replaced with real local state management before serious deployment

const fs = require('fs');
const { get, set, includes, tail, flow, split, join } = require('lodash/fp');

const LOCAL_STATE_FILEPATH = './state.json';
const LOCAL_CONFIG_FILEPATH = './config.json';

//TODO: hash and decode for paths containing passwords
const getStateValueByPath = (path) =>
  get(
    path,
    includes('config', path)
      ? { config: require('../config.json') || getConfigEnvironmentVariables() }
      : _getLocalState()
  );

const setStateValueForPath = (path, newValue) => {
  const isConfig = includes('config', path);
  const filePath = isConfig ? LOCAL_CONFIG_FILEPATH : LOCAL_STATE_FILEPATH;
  const localState = _getLocalState(filePath);

  newLocalState = set(
    isConfig ? flow(split('.'), tail, join('.'))(path) : path,
    newValue,
    localState
  );

  fs.writeFileSync(filePath, JSON.stringify(newLocalState));

  return newLocalState;
};

const _getLocalState = (path = LOCAL_STATE_FILEPATH) =>
  fs.existsSync(path) ? JSON.parse(fs.readFileSync(path, 'utf8')) : {};

//TODO: document state schema

const getConfigEnvironmentVariables = () => ({
  slackBotToken: process.env.POLARITY_SLACK_APP_BOT_TOKEN,
  appToken: process.env.POLARITY_SLACK_APP_TOKEN //https://api.slack.com/authentication/config-tokens
});

module.exports = {
  setStateValueForPath,
  getStateValueByPath
};
