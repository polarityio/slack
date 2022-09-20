const { requestWithDefaults } = require('../request');

const displayLoginInfoMessage = (responseUrl) =>
  requestWithDefaults({
    method: 'POST',
    site: 'slack',
    url: responseUrl,
    headers: { 'Content-type': 'application/json' },
    body: {
      replace_original: true,
      blocks: [
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `\n:exclamation: Must log in to to polarity to search with \`/polarity\` command. _Go to Polarity App in Slack to Log In..._`
            }
          ]
        }
      ]
    }
  });

module.exports = displayLoginInfoMessage;
