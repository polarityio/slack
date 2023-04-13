const buildMinimizedHomePageIntegrationBlocks = ({
  integration: { id, name },
  includeInSearch
}) => [
  {
    type: 'section',
    block_id: `appHome.integrations.includeInSearchCheckbox.index.${id}`,
    text: {
      type: 'mrkdwn',
      text: `_*${name}*_`
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

module.exports = buildMinimizedHomePageIntegrationBlocks;
