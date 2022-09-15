'use strict';

const _validateOptions = require('./src/validateOptions');
const createRequestWithDefaults = require('./src/createRequestWithDefaults');

const getLookupResults = require('./src/getLookupResults');
const { parseErrorToReadableJSON } = require('./src/dataTransformations');

const sendMessage = require('./src/sendMessage');
const loadMoreSearchMessages = require('./src/loadMoreSearchMessages');
const slackCommandStartup = require('./slack-command');
const ngrok = require('ngrok');
const { publishUrlToManifest } = require('./slack-command/src/publishToSlack');

let Logger;
let requestWithDefaults;
const startup = async (logger) => {
  Logger = logger;

  await slackCommandStartup(Logger)

  requestWithDefaults = createRequestWithDefaults(Logger);
};

const doLookup = async (entities, options, cb) => {
  Logger.debug({ entities }, 'Entities');
  options.url = options.url.endsWith('/') ? options.url.slice(0, -1) : options.url;

  let lookupResults;
  try {
    lookupResults = await getLookupResults(
      entities,
      options,
      requestWithDefaults,
      Logger
    );
  } catch (error) {
    const err = parseErrorToReadableJSON(error);
    Logger.error({ error, formattedError: err }, 'Get Lookup Results Failed');

    return cb({ detail: error.message || 'Command Failed', err });
  }

  Logger.trace({ lookupResults }, 'Lookup Results');
  cb(null, lookupResults);
};

const getOnMessage = { sendMessage, loadMoreSearchMessages };

const onMessage = ({ action, data: actionParams }, options, callback) =>
  getOnMessage[action](actionParams, options, requestWithDefaults, callback, Logger);

const validateOptions = (options, callback) =>
  _validateOptions(options, callback, Logger);

(async ()=> {
  const url = await ngrok.connect({
    proto: 'http', // http|tcp|tls, defaults to http
    addr: 3000, // port or network address, defaults to 80
    // auth: 'user:pwd', // http basic authentication for tunnel
    // subdomain: 'alex', // reserved tunnel name https://alex.ngrok.io
    region: 'us', // one of ngrok regions (us, eu, au, ap, sa, jp, in), defaults to us
    configPath: '~/git/project/ngrok.yml', // custom path for ngrok config file
    // binPath: (path) => path.replace('app.asar', 'app.asar.unpacked'), // custom binary path, eg for prod in electron
    onStatusChange: (data) =>
      console.log(JSON.stringify({ MESSAGE: 'STATUS CHANGE', data }, null, 2)), // 'closed' - connection is lost, 'connected' - reconnected
    onLogEvent: (data) =>
      console.log(JSON.stringify({ MESSAGE: 'EVENT LOG', data }, null, 2)) // returns stdout messages from ngrok process
  });
  await publishUrlToManifest(url);
})()

module.exports = {
  startup,
  validateOptions,
  doLookup,
  onMessage
};
