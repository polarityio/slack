const { requestWithDefaults } = require('../request');

const displayNoSearchStringMessage = (responseUrl) =>
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
                '\n You used the `/polarity` command :confetti_ball:, but it was used without a search string. :thinking_face:\n' +
                '> _Did you mean to add a search string :shrug: like this:_ `/polarity <polarity-search-string>`:question:'
            }
          ]
        }
      ]
    }
  });

module.exports = displayNoSearchStringMessage;
