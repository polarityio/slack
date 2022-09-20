const buildHomePageIntegrationBlocks = ({
  integration: { id, name, description },
  includeInSearch
}) => [
  { type: 'divider' },
  {
    type: 'section',
    fields: [
      {
        type: 'mrkdwn',
        text: `_*${name}*_`
      }
    ]
  },
  {
    type: 'section',
    block_id: `appHome.integrations.includeInSearchCheckbox.index.${id}`,
    text: {
      type: 'plain_text',
      text: description
    },
    accessory: {
      type: 'checkboxes',
      action_id: `toggleIncludeInSearch.${id}`,
      options: [
        {
          text: {
            type: 'mrkdwn',
            text: '_Include In Search_'
          }
        }
      ],
      ...(includeInSearch && {
        initial_options: [
          {
            text: {
              type: 'mrkdwn',
              text: '_Include In Search_'
            }
          }
        ]
      })
    }
  }
];

module.exports = buildHomePageIntegrationBlocks;
