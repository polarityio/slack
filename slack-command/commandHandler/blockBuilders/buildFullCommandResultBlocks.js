const { size } = require('lodash/fp');

const buildFullCommandResultBlocks = (
  profilePicture,
  slackUserName,
  searchText,
  integrationsSearchResultsSummaryTags
) => [
  {
    type: 'context',
    elements: [
      {
        type: 'image',
        image_url: profilePicture,
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
        text: `> _<${
          require('../../../config/config.js').slackCommandServer.polarityUrl
        }/search?q=${searchText}|Search In Polarity>_`
      }
    ]
  },
  { type: 'divider' },
  {
    type: 'context',
    elements: size(integrationsSearchResultsSummaryTags)
      ? integrationsSearchResultsSummaryTags
      : [
          {
            type: 'mrkdwn',
            text: `_No Overlay *Summary Tags* found for *${searchText}*_`
          }
        ]
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
        text: 'Posted using `/polarity`'
      }
    ]
  }
];

module.exports = buildFullCommandResultBlocks;
