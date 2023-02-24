const buildHomePagePolarityCredentialsBlocks = ({
  hidePolarityCredentials,
  ...remainingCredentials
} = {}) => [
  {
    type: 'section',
    block_id: 'appHome.credentials.showHideOverflowDropdown',
    text: {
      type: 'mrkdwn',
      text: '*_Polarity Service Account Credentials:_*'
    },
    accessory: {
      type: 'overflow',
      action_id: 'toggleShowPolarityCredentials',
      options: [
        hidePolarityCredentials
          ? {
              text: {
                type: 'plain_text',
                text: 'show'
              },
              value: 'show'
            }
          : {
              text: {
                type: 'plain_text',
                text: 'hide'
              },
              value: 'hide'
            }
      ]
    }
  },
  ...(hidePolarityCredentials
    ? []
    : [
        { type: 'divider' },
        ...displayCredentialsForm(remainingCredentials),
        ...displayLoginStatus(remainingCredentials)
      ])
];

const displayLoginStatus = ({ polarityUsername, polarityPassword, polarityCookie }) =>
  !(polarityUsername && polarityPassword) && !polarityCookie
    ? [
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: ':exclamation: Once you enter the Polarity Service Account Username & Password, users will be able to search available Polarity Integrations in Slack using `/polarity`'
            }
          ]
        }
      ]
    : [
        ...(!polarityCookie
          ? [
              {
                type: 'context',
                elements: [
                  {
                    type: 'mrkdwn',
                    text: '> :interrobang: Incorrect Username Or Password'
                  }
                ]
              }
            ]
          : [
              {
                type: 'context',
                elements: [
                  {
                    type: 'mrkdwn',
                    text: '> :white_check_mark: Logged In'
                  }
                ]
              }
            ])
      ];

const displayCredentialsForm = ({ polarityCookie, polarityUsername, polarityPassword }) =>
  !polarityCookie
    ? [
        {
          dispatch_action: true,
          block_id: 'appHome.credentials.usernameInput',
          type: 'input',
          element: {
            action_id: 'changePolarityUsername',
            type: 'plain_text_input',
            dispatch_action_config: {
              trigger_actions_on: ['on_character_entered']
            },
            placeholder: {
              type: 'plain_text',
              text: 'Add Username',
              emoji: true
            },
            initial_value: polarityUsername || ''
          },
          label: {
            type: 'plain_text',
            text: `:bust_in_silhouette: Username${polarityUsername ? '' : ' *'}`,
            emoji: true
          }
        },

        ...displayPasswordField(polarityPassword),
        { type: 'divider' }
      ]
    : [
        {
          type: 'actions',
          block_id: 'appHome.credentials.logout',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: ':writing_hand: Change Credentials'
              },
              action_id: 'logout'
            }
          ]
        }
      ];

const displayPasswordField = (polarityPassword) => [
  {
    dispatch_action: true,
    block_id: 'appHome.credentials.passwordInput',
    type: 'input',
    element: {
      action_id: 'changePolarityPassword',
      type: 'plain_text_input',
      dispatch_action_config: {
        trigger_actions_on: ['on_character_entered']
      },
      placeholder: {
        type: 'plain_text',
        text: 'Add Password',
        emoji: true
      },
      initial_value: polarityPassword || ''
    },
    label: {
      type: 'plain_text',
      text: `:lock: Password${polarityPassword ? '' : ' *'}`,
      emoji: true
    }
  }
];

module.exports = buildHomePagePolarityCredentialsBlocks;
