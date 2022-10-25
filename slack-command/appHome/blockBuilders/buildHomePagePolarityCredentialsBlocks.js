const { replace } = require('lodash/fp');

const buildHomePagePolarityCredentialsBlocks = ({
  hidePolarityCredentials,
  polarityCookie,
  polarityUsername,
  polarityPassword,
  showPasswordField
} = {}) => [
  {
    type: 'section',
    block_id: 'appHome.credentials.showHideOverflowDropdown',
    text: {
      type: 'mrkdwn',
      text: '*_Polarity Credentials:_*'
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
        ...displayCredentialsForm(
          polarityCookie,
          polarityUsername,
          polarityPassword,
          showPasswordField
        ),
        ...displayLoginStatus(polarityUsername, polarityPassword, polarityCookie)
      ])
];

const displayLoginStatus = (polarityUsername, polarityPassword, polarityCookie) =>
  !(polarityUsername && polarityPassword) && !polarityCookie
    ? [
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: ":exclamation: Once you enter your Polarity Username & Password, you'll be able to search your available Polarity Integrations in Slack using `/polarity`"
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

const displayCredentialsForm = (
  polarityCookie,
  polarityUsername,
  polarityPassword,
  showPasswordField
) =>
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

        ...displayPasswordField(showPasswordField, polarityPassword),
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

const displayPasswordField = (showPasswordField, polarityPassword) =>
  showPasswordField
    ? [
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
        },
        {
          type: 'actions',
          block_id: 'appHome.credentials.toggleShowPasswordButton',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: ':see_no_evil:',
                emoji: true
              },
              action_id: 'hidePasswordInputField'
            }
          ]
        }
      ]
    : [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `:lock: *Password*${polarityPassword ? '' : ' *'}`
          }
        },
        {
          type: 'section',
          block_id: 'appHome.credentials.toggleShowPasswordButton',
          text: {
            type: 'mrkdwn',
            text: `> ${
              polarityPassword ? replace(/./g, '*', polarityPassword) : '_Empty_ '
            }`
          },
          accessory: {
            type: 'button',
            text: {
              type: 'plain_text',
              text: ':lower_left_fountain_pen:',
              emoji: true
            },
            action_id: 'showPasswordInputField'
          }
        }
      ];

module.exports = buildHomePagePolarityCredentialsBlocks;
