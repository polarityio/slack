const { appendFileSync } = require('fs');
const { forEach, getOr } = require('lodash/fp');
const pids = require('port-pid');

const stopCommandServer = async () => {
  const commandServerPort = require('../config/slack-config').portNumber;

  const allPortPids = getOr([], 'all', await pids(commandServerPort));

  forEach((pid) => { try { process.kill(pid); } catch {}}, allPortPids);

  try { require('child_process').execSync('killall ngrok 1> /dev/null') } catch {}

  const MESSAGE = '\n********  Slack Command Server Background Process has Stopped  ********\n';
  
  console.log(MESSAGE);

  appendFileSync('./logs/slack-command-server.log', MESSAGE);
}

module.exports = stopCommandServer;