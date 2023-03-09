const { flatMap, size, get } = require('lodash/fp');
const buildHomePageIntegrationBlocks = require('./buildHomePageIntegrationBlocks');
const buildHomePagePolarityCredentialsBlocks = require('./buildHomePagePolarityCredentialsBlocks');
const buildMinimizedHomePageIntegrationBlocks = require('./buildMinimizedHomePageIntegrationBlocks');


const assembleAppHomePageBlocks = (
  userIsAdmin,
  serviceAccountCredentials,
  polarityPassword,
  integrationSubscriptions,
  minimizeIntegrationsBlocksSize = false
) => [
  ...(userIsAdmin
    ? buildHomePagePolarityCredentialsBlocks({
        ...serviceAccountCredentials,
        polarityPassword
      })
    : []),
  ...(!userIsAdmin && !get('polarityCookie', serviceAccountCredentials)
    ? [
        {
          type: 'section',
          block_id: 'appHome.credentials.showHideOverflowDropdown',
          text: {
            type: 'mrkdwn',
            text: '*_:exclamation: Not Logged into Polarity:_*'
          }
        },
        {
          type: 'section',
          text: [
            {
              type: 'mrkdwn',
              text: ':white_small_square: _Contact a Slack Admin to add the Polarity Service Account Credentials._\n'
            }
          ]
        }
      ]
    : []),
  ...(size(integrationSubscriptions) && get('polarityCookie', serviceAccountCredentials)
    ? [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: 'Integrations:'
          }
        },
        ...flatMap(
          minimizeIntegrationsBlocksSize
            ? buildMinimizedHomePageIntegrationBlocks
            : buildHomePageIntegrationBlocks,
          integrationSubscriptions
        )
      ]
    : [])
];

module.exports = assembleAppHomePageBlocks;
