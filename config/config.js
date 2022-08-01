module.exports = {
  name: 'Slack',
  acronym: 'SLACK',
  description:
    'Send Messages to Slack directly from the Overlay, and Search Entities in Slack Channel Messages.',
  entityTypes: ['*'],
  // customTypes: [
  //   {
  //     key: 'allText',
  //     regex: /\S[\s\S]{0,256}\S/
  //   }
  // ],
  styles: ['./styles/styles.less'],
  defaultColor: 'light-purple',
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
    rejectUnauthorized: true
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
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
        'The API User Token associated with the your Polarity Slack App. ' +
        'Your User Token should start with "xoxp-###...". Optional if you don\'t wish to ' +
        'search and uncheck "Allow Searching Slack Messages"',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'botToken',
      name: 'Bot Token',
      description:
        'The API Bot Token associated with the your Polarity Slack App. ' +
        'Your User Token should start with "xoxb-###..."',
      default: '',
      type: 'password',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'allowSearchingMessages',
      name: 'Allow Searching Slack Messages',
      description: 'If checked, all entities will be search in Slack',
      default: true,
      type: 'boolean',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'sortBy',
      name: 'Sort Message Search Results By',
      description: 'Return the search results in a particular order',
      default: {
        value: 'score,desc',
        display: 'Best Search Match First'
      },
      type: 'select',
      options: [
        {
          value: 'score,desc',
          display: 'Best Search Match First'
        },
        {
          value: 'timestamp,desc',
          display: 'Most Recent Search Match First'
        },
        {
          value: 'timestamp,asc',
          display: 'Oldest Search Match First'
        }
      ],
      multiple: false,
      userCanEdit: true,
      adminOnly: false
    },
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
    //   key: 'excludeSearchChannelNames',
    //   name: 'Slack Channel Names to Exclude from Searching',
    //   description:
    //     'A comma separated list of Channels Names that will be ignored during searched.\n' +
    //     '"NOTE:" If left empty, all available Channels will be searched.',
    //   default: 'jira_updates',
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
        'A comma separated list of Channels Names anyone using the Integration can send a ' +
        'messages to. If you want to send messages to a private channel, you must send a ' +
        'message in the channel containing "@Polarity" in it first.',
      default: 'general',
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
