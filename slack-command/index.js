const express = require('express');
const bodyParser = require('body-parser');
const { getOr, get, stubFalse, flow, split, head, replace } = require('lodash/fp');

const { publishUrlToManifest } = require('./slack');
const authenticateSlack = require('./request/authenticateSlack');
const handleSlackCommand = require('./commandHandler');
const eventHandlers = require('./eventHandlers');
const actionHandlers = require('./actionHandlers');
const { parseErrorToReadableJSON } = require('../src/dataTransformations');
const { inspect } = require('util');
const PORT_NUMBER = require('../config/slack-config').portNumber;

const app = express();
app.use(bodyParser.text({ type: 'application/*' })); // support json encoded bodies
app.use(authenticateSlack);

const slackCommandStartup = async (Logger, runningAsDeveloper) => {
  const doExtraLogging =
    runningAsDeveloper || get('logging.level', require('../config/config')) !== 'info';
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
      actionURL: `${url}/_slackcommand/actions`,
      cmdURL: `${url}/_slackcommand/command`,
      eventsURL: `${url}/_slackcommand/events`
    });

    await publishUrlToManifest(url);
  }

  app.post('/_slackcommand/command', async (req, res) => {
    res.send();

    const requestBody = flow(get('body'), (body) =>
      Object.fromEntries(new URLSearchParams(body))
    )(req);

    const slackUserId = get('user_id', requestBody);
    const searchText = flow(get('text'), replace(/[\*\_\`]/g, ''))(requestBody);
    const responseUrl = get('response_url', requestBody);
    if (doExtraLogging)
      Logger.info({ MESSAGE: 'Slack Command Running', slackUserId, searchText, responseUrl });
    try {
      await handleSlackCommand(slackUserId, searchText, responseUrl);
      if (doExtraLogging)
        Logger.info({ MESSAGE: 'Slack Command has Run Successfully' });
    } catch (error) {
      const err = parseErrorToReadableJSON(error);
      Logger.error(
        { slackUserId, searchText, responseUrl, error, formattedError: err },
        'Slack Command Handling Failed'
      );
    }
  });

  app.post('/_slackcommand/actions', async (req, res) => {
    const requestBody = flow(get('body'), (body) =>
      Object.fromEntries(new URLSearchParams(body))
    )(req);;

    const actionPayload = flow(get('payload'), JSON.parse)(requestBody);

    const handleThisAction = async (...args) =>
      await get(
        flow(get('actions.0.block_id'), split('.index'), head)(actionPayload),
        actionHandlers
      )(...args);

      if (doExtraLogging)
        Logger.info({
          MESSAGE: 'Slack Action Running',
          actionPayload,
          handleThisAction: inspect(handleThisAction)
        });
    let handledActionResponseToSendToSlack;
    try {
      handledActionResponseToSendToSlack = await handleThisAction(actionPayload);
      if (doExtraLogging)
        Logger.info({
          MESSAGE: 'Slack Action has Run Successfully',
          handledActionResponseToSendToSlack
        });
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

  app.post('/_slackcommand/events', async (req, res) => {
    const requestBody = flow(get('body'), JSON.parse)(req);

    const handleThisEvent = async (...args) =>
      await getOr(stubFalse, get('event.type', requestBody), eventHandlers)(...args);

    if (doExtraLogging)
      Logger.info({
        MESSAGE: 'Slack Event Running',
        eventType: get('event.type', requestBody),
        handleThisEvent: inspect(handleThisEvent)
      });
    let handledEventResponseToSendToSlack;
    try {
      handledEventResponseToSendToSlack = await handleThisEvent(requestBody);
      if (doExtraLogging)
        Logger.info({
          MESSAGE: 'Slack Event has Run Successfully',
          handledEventResponseToSendToSlack
        });
    } catch (error) {
      const err = parseErrorToReadableJSON(error);
      Logger.error(
        { event: get('event', requestBody), error, formattedError: err },
        'Slack Event Handling Failed'
      );
    } finally {
      res.send({
        ...handledEventResponseToSendToSlack,
        challenge: get('challenge', requestBody)
      });
    }
  });

  app.listen(PORT_NUMBER, '127.0.0.1');

  Logger.info(
    `\n\n******* Slack Command Server Running on Port ${PORT_NUMBER} *******\n\n`
  );
};

module.exports = slackCommandStartup;
