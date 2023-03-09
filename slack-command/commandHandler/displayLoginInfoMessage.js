const { requestWithDefaults } = require('../request');

const displayLoginInfoMessage = (responseUrl) =>
  requestWithDefaults({
    method: 'POST',
    site: 'slack',
    url: responseUrl,
    headers: { 'Content-type': 'application/json' },
    body: {
      response_type: 'ephemeral',
      replace_original: true,
      blocks: [
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text:
                '\n:exclamation: Must log in to Polarity to search with `/polarity`.\n' +
                '>   _Credentials can be entered via the Polarity App in Slack by a Slack Admin._\n' +
                '>   _This may happen when restarting your Polarity Server._'
            }
          ]
        }
      ]
    }
  });

module.exports = displayLoginInfoMessage;
