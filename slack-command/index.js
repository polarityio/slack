const ngrok = require('ngrok');
const express = require('express');
const bodyParser = require('body-parser');
const {
  getOr,
  get,
  stubFalse,
  __,
  flow,
  split,
  head,
  filter,
  concat,
  join,
  flatMap,
  compact,
  map,
  find,
  eq,
  identity,
  isString,
  replace
} = require('lodash/fp');
const http = require('http');
const eventHandlers = require('./src/eventHandlers');
const actionHandlers = require('./src/actionHandlers');
const { publishUrlToManifest } = require('./src/publishToSlack');
const { requestWithDefaults } = require('./src/request');
const { getStateValueByPath } = require('./src/pseudoStateManager');
const Parselarity = require('./parselarityjs'); //change to npm path on server
const { and } = require('./src/dataTransformations');

const PORT_NUMBER = 3000;

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const slackCommandStartup = async (Logger) => {
  // await ngrok.disconnect(); // stops all
  await ngrok.kill(); // kills ngrok process
  Logger.trace({ test: 2222222222222222222 });

  const url = await ngrok.connect({
    proto: 'http', // http|tcp|tls, defaults to http
    addr: PORT_NUMBER, // port or network address, defaults to 80
    authtoken: '',
    // auth: 'user:pwd', // http basic authentication for tunnel
    // subdomain: 'penwood', // reserved tunnel name https://alex.ngrok.io
    region: 'us', // one of ngrok regions (us, eu, au, ap, sa, jp, in), defaults to us
    // configPath: 'project/ngrok.yml', // custom path for ngrok config file
    // binPath: (path) => path.replace('app.asar', 'app.asar.unpacked'), // custom binary path, eg for prod in electron
    onStatusChange: (data) =>
      console.log(JSON.stringify({ MESSAGE: 'STATUS CHANGE', data }, null, 2)), // 'closed' - connection is lost, 'connected' - reconnected
    onLogEvent: (data) =>
      console.log(JSON.stringify({ MESSAGE: 'EVENT LOG', data }, null, 2)) // returns stdout messages from ngrok process
  });
//TODO: log out state here to make sure we're getting config path correctly
  Logger.trace({
    MESSAGE: 'New ngrok URL Copied to Clipboard',
    url,
    actionURL: `${url}/actions`,
    cmdURL: `${url}/command`,
    eventsURL: `${url}/events`
  });

  await publishUrlToManifest(url);

  Logger.trace({
    MESSAGE: 'New ngrok URL Copied to Clipboard',
    url,
    actionURL: `${url}/actions`,
    cmdURL: `${url}/command`,
    eventsURL: `${url}/events`
  });

  app.post('/command', async (req, res) => {
    res.send();

    const slackUserId = get('body.user_id', req);
    const searchText = flow(get('body.text'), replace(/[*_`]/g, ''))(req);
    const entities = Parselarity.parse(searchText);
    console.log('🚀 ~ file: index.js ~ line 50 ~ app.post ~ req Parselarity', entities);
    //TODO: if not logged in display different message that is hard coded directing them to the app home from a picture hosted on the slack integration assets folder like the polarity icon in the cmd respons footer

    const slackUser = get(
      'body.profile',
      await requestWithDefaults({
        method: 'GET',
        site: 'slack',
        route: 'users.profile.get',
        headers: { 'Content-Type': 'application/json' },
        qs: {
          user: slackUserId
        }
      })
    );

    const integrationSubscriptions = flow(
      getStateValueByPath,
      get('slackAppHomeState.integrationSubscriptions')
    )(slackUserId);

    //TODO: add support for channel tags and add channels to slack app home menu
    const integrationsIdsToSearch = flow(
      filter(get('includeInSearch')),
      map(get('integration.id'))
    )(integrationSubscriptions);

    const integrationsSearchResults = await Promise.all(
      map(
        async (stateIntegrationId) =>
          get(
            'body.data',
            await requestWithDefaults({
              method: 'POST',
              site: 'polarity',
              route: `v2/integration-lookups/${stateIntegrationId}`,
              slackUserId,
              headers: { 'Content-Type': 'application/json' },
              body: { data: { type: 'integration-lookups', attributes: { entities } } } //TODO: concat parsed custom types
            })
          ),
        integrationsIdsToSearch
      )
    );

    const integrationsSearchSummaryTags = flow(
      map((integrationSearchResults) => {
        const integrationName = flow(
          get('id'),
          (searchResultIntId) =>
            find(
              flow(get('integration.id'), eq(searchResultIntId)),
              integrationSubscriptions
            ),
          get('integration.name')
        )(integrationSearchResults);

        const summaryTagStrings = flow(
          get('attributes.results'),
          flatMap(get('data.summary')),
          filter(and(identity, isString)),
          concat(''),
          join('\n>:white_small_square: ')
        )(integrationSearchResults);

        return (
          summaryTagStrings && {
            type: 'mrkdwn',
            text: `*${integrationName}*     \n ${summaryTagStrings}`
          }
        );
      }),
      compact
    )(integrationsSearchResults);
    const slackUserName = get('real_name_normalized', slackUser);

    requestWithDefaults({
      method: 'POST',
      site: 'slack',
      url: get('body.response_url', req),
      headers: { 'Content-type': 'application/json' },
      body: {
        response_type: 'in_channel',
        replace_original: true,
        blocks: [
          {
            type: 'context',
            elements: [
              {
                type: 'image',
                image_url: get('image_48', slackUser),
                alt_text: `${slackUserName} Profile Picture`
              },
              {
                type: 'mrkdwn',
                text: `Searched by *${slackUserName}* `
              },
              {
                type: 'mrkdwn',
                text: `> :mag:  *\`   ${searchText}   \`*  :mag:`
              },
              {
                type: 'mrkdwn',
                text: `> _<https://www.youtube.com/watch?v=dQw4w9WgXcQ|Search In Polarity>_`
                // text: `> _<https://dev.polarity/search?q=${searchText}|Search In Polarity>_`
              }
            ]
          },
          { type: 'divider' },
          {
            type: 'context',
            elements: integrationsSearchSummaryTags
          },
          {
            type: 'context',
            elements: [
              {
                type: 'image',
                image_url:
                  'https://raw.githubusercontent.com/polarityio/slack/develop/assets/app-profile-picture.png',
                alt_text: 'Polarity Picture'
              },
              {
                type: 'mrkdwn',
                text: 'Posted using `/polarity`' // ${searchText}`
              }
            ]
          }
        ]
      }
    });
  });

  app.post('/actions', async (req, res) => {
    const actionPayload = flow(get('body.payload'), JSON.parse)(req);

    const handleThisAction = async (...args) =>
      await get(
        flow(get('actions.0.block_id'), split('.index'), head)(actionPayload),
        actionHandlers
      )(...args);

    let handledActionResponseToSendToSlack;
    try {
      handledActionResponseToSendToSlack = await handleThisAction(actionPayload);
    } finally {
      res.send({ ...handledActionResponseToSendToSlack });
    }
  });

  app.post('/events', async (req, res) => {
    const externalIp = await requestWithDefaults({ url: 'http://myexternalip.com/raw' });
    // await publishUrlToManifest(externalIp);

    console.log({ test: 11111111111111111, externalIp, asdf: get('body', req) });
    const handleThisEvent = async (...args) =>
      await getOr(stubFalse, get('body.event.type', req), eventHandlers)(...args);

    let handledEventResponseToSendToSlack;
    try {
      handledEventResponseToSendToSlack = await handleThisEvent(req);
    } finally {
      res.send({
        ...handledEventResponseToSendToSlack,
        challenge: get('body.challenge', req)
      });
    }
  });

  app.listen(PORT_NUMBER);

  // app.listen = function () {
  //   const server = http.createServer(this);
  //   return server.listen(PORT_NUMBER);
  // };

  Logger.trace({ test: 3333333333333333333 });
};

// slackCommandStartup(console);

module.exports = slackCommandStartup;
