polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  availableChannelsToMessage: [],
  messageValue: '',
  sendingMessage: false,
  messagingToast: '',
  errorMessagingToast: '',
  sendingMessage: '',
  selectedChannel: {},
  init() {
    const availableChannelsToMessage = this.get('block.userOptions.messagingChannelNames')
      .split(',')
      .map((channelName) =>
        this.get('details.channels').find(
          ({ name }) => name == channelName.trim().toLowerCase().replace(/ /g, '-')
        )
      )
      .filter((x) => x);
    this.set('availableChannelsToMessage', availableChannelsToMessage);
    this.set('selectedChannel', availableChannelsToMessage[0]);
    this._super(...arguments);
  },
  actions: {
    selectChannel:function (selectedChannelId) {
      this.set(
        'selectedChannel',
        this.get('details.channels').find(({ id }) => id == selectedChannelId)
      );
    },
    sendMessage: function () {
      const outerThis = this;
      outerThis.set('messagingToast', '');
      outerThis.set('errorMessagingToast', '');
      outerThis.set('sendingMessage', true);
      outerThis.get('block').notifyPropertyChange('data');

      outerThis
        .sendIntegrationMessage({
          action: 'sendMessage',
          data: {
            text: this.get('messageValue'),
            channel: this.get('selectedChannel').id
          }
        })
        .then(() => {
          outerThis.set('messageValue', '');
          outerThis.set('messagingToast', 'Successfully Sent Message');
        })
        .catch((err) => {
          outerThis.set(
            'errorMessagingToast',
            'Failed to Send Message: ' +
              (err &&
                (err.detail || err.err || err.message || err.title || err.description)) ||
              'Unknown Reason'
          );
        })
        .finally(() => {
          outerThis.set('sendingMessage', false);
          outerThis.get('block').notifyPropertyChange('data');
          setTimeout(() => {
            outerThis.set('messagingToast', '');
            outerThis.set('errorMessagingToast', '');
            outerThis.get('block').notifyPropertyChange('data');
          }, 5000);
        });
    }
  }
});
