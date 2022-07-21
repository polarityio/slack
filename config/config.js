module.exports = {
  name: 'Slack',
  acronym: 'SLACK',
  description: 'Send Messages to Slack directly from the Overlay, and Query Messages.',
  entityTypes: ['*'],
  customTypes: [
    {
      key: 'allText',
      regex: /\S[\s\S]{0,256}\S/
    }
  ],
  styles: ['./styles/styles.less'],
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  request: {
    cert: '',
    key: '',
    passphrase: '',
    ca: '',
    proxy: '',
    rejectUnauthorized: false
  },
  logging: {
    level: 'trace' //trace, debug, info, warn, error, fatal
  },
  options: [
    {
      key: 'url',
      name: 'Slack API URL',
      description: 'The URL of the Slack API you would like to connect to',
      default: 'https://slack.com/api',
      type: 'text',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'userToken',
      name: 'User Token',
      description:
        'The API User Token associated with the your Polarity Slack App.' +
        'Your User Token should start with "xoxp-###...". Instructions to find your ' +
        'token can be found in you Integrations "./README.md" file.',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'botToken',
      name: 'Bot Token',
      description:
        'The API Bot Token associated with the your Polarity Slack App.' +
        'Your User Token should start with "xoxb-###...". Instructions to find your ' +
        'token can be found in you Integrations "./README.md" file.',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    // {
    //   key: 'allowSearchingMessages',
    //   name: 'Allow Searching Slack Messages',
    //   description:
    //     'If checked, all entities will be search in the Channels listed below.',
    //   default: true,
    //   type: 'boolean',
    //   userCanEdit: true,
    //   adminOnly: false
    // },
    // {
    //   key: 'searchOnDetails',
    //   name: 'Search After Opening',
    //   description:
    //     'If checked, all entities searches in the Channels listed below will be '+
    //     'preformed after you open the overlay result.  "NOTE:" If checked while "Allow '+
    //     'Sending Slack Messages" is unchecked, a "No Results Found" message will '+
    //     'appear for every entity.',
    //   default: true,
    //   type: 'boolean',
    //   userCanEdit: true,
    //   adminOnly: false
    // },
    // {
    //   key: 'searchChannelNames',
    //   name: 'Slack Channel Names for Searching',
    //   description:
    //     'A comma separated list of Channels Names that will be searched.\n' +
    //     '"NOTE:" If left empty, all available Channels will be searched.',
    //   default: 'general, _fab, polarity-bug-reports, _target',
    //   type: 'text',
    //   userCanEdit: false,
    //   adminOnly: true
    // },
    {
      key: 'allowSendingMessages',
      name: 'Allow Sending Slack Messages',
      description:
        'If checked, a prompt will show for every entity searched, regardless of Search ' +
        'Results, allowing you to send a message to any Channels listed below.',
      default: true,
      type: 'boolean',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'messagingChannelNames',
      name: 'Slack Channel Names for Messages',
      description:
        'A comma separated list of Channels Names anyone using the Integration can send a messages to.\n' +
        '"NOTE:" If left empty, you will not be able to Message any Channels.',
      default:
        'slack-int-testing, test-slack-int, general, _fab, polarity-bug-reports, _target',
      type: 'text',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'messagingDisplayName',
      name: 'Slack Messaging Display Name',
      description:
        'The name you wish to use when Posting Messages on Slack Channels.  If left empty the default display name will just be "Polarity".',
      default: '',
      type: 'text',
      userCanEdit: true,
      adminOnly: false
    }
  ]
};
