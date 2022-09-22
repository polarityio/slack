const express = require('express');
const bodyParser = require('body-parser');
const { getOr, get, stubFalse, flow, split, head, replace } = require('lodash/fp');

const { publishUrlToManifest } = require('./slack');
const handleSlackCommand = require('./commandHandler');
const eventHandlers = require('./eventHandlers');
const actionHandlers = require('./actionHandlers');
const { parseErrorToReadableJSON } = require('../src/dataTransformations');

const PORT_NUMBER = require('../config/config').slackCommandServer.portNumber;

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const slackCommandStartup = async (Logger, runningAsDeveloper) => {
  if (runningAsDeveloper) {
    const ngrok = require('ngrok');

    await ngrok.disconnect(); // stops all
    await ngrok.kill(); // kills ngrok process

    const url = await ngrok.connect({
      addr: PORT_NUMBER, // port or network address, defaults to 80
      region: 'us', // one of ngrok regions (us, eu, au, ap, sa, jp, in), defaults to us
      onStatusChange: (data) =>
        Logger.info(JSON.stringify({ MESSAGE: 'NGROK STATUS CHANGE', data }, null, 2)), // 'closed' - connection is lost, 'connected' - reconnected
      onLogEvent: (data) =>
        Logger.info(JSON.stringify({ MESSAGE: 'NGROK EVENT LOG', data }, null, 2)) // returns stdout messages from ngrok process
    });

    Logger.info({
      MESSAGE: 'New ngrok URLs',
      url,
      actionURL: `${url}/actions`,
      cmdURL: `${url}/command`,
      eventsURL: `${url}/events`
    });

    await publishUrlToManifest(url);
  }

  app.post('/command', async (req, res) => {
    res.send();

    const slackUserId = get('body.user_id', req);
    const searchText = flow(get('body.text'), replace(/[\*\_\`]/g, ''))(req);
    const responseUrl = get('body.response_url', req);

    try {
      await handleSlackCommand(slackUserId, searchText, responseUrl);
    } catch (error) {
      const err = parseErrorToReadableJSON(error);
      Logger.error(
        { slackUserId, searchText, responseUrl, error, formattedError: err },
        'Slack Command Handling Failed'
      );
    }
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
    } catch (error) {
      const err = parseErrorToReadableJSON(error);
      Logger.error(
        {
          actionPayload,
          handledActionResponseToSendToSlack,
          error,
          formattedError: err
        },
        'Slack Action Handling Failed'
      );
    } finally {
      res.send({ ...handledActionResponseToSendToSlack });
    }
  });

  app.post('/events', async (req, res) => {
    const handleThisEvent = async (...args) =>
      await getOr(stubFalse, get('body.event.type', req), eventHandlers)(...args);

    let handledEventResponseToSendToSlack;
    try {
      handledEventResponseToSendToSlack = await handleThisEvent(req);
    } catch (error) {
      const err = parseErrorToReadableJSON(error);
      Logger.error(
        { event: get('body.event', req), error, formattedError: err },
        'Slack Event Handling Failed'
      );
    } finally {
      res.send({
        ...handledEventResponseToSendToSlack,
        challenge: get('body.challenge', req)
      });
    }
  });

  app.listen(PORT_NUMBER);

  Logger.info(
    `\n\n******* Slack Command Server Running on Port ${PORT_NUMBER} *******\n\n`
  );
};

module.exports = slackCommandStartup;
