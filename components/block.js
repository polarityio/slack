polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  timezone: Ember.computed('Intl', function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }),
  maxSimultaneousAvatarLookups: 5,
  messageValue: '',
  sendingMessage: false,
  messagingToast: '',
  errorMessagingToast: '',
  selectedChannel: {},
  foundMessageSearchResultsOpen: false,
  loadingMoreMessages: false,
  channelsToSendTo: Ember.computed.alias('details.channelsToSendTo'),
  init() {
    this.set('avatars', {});
    this.set('selectedChannel', this.get('channelsToSendTo.0'));
    this.set(
      'messageValue',
      this.get('block.userOptions.addEntityToMessageByDefault')
        ? this.get('block.entity.value')
        : ''
    );
    this.set('hasMoreResults', true);

    this._super(...arguments);
  },
  actions: {
    toggleShowingFoundMessages: function () {
      this.toggleProperty('foundMessageSearchResultsOpen');
      if (this.get('block.userOptions.enableAvatars')) {
        this.loadAvatars();
      }
    },
    showMoreOfMessage: function (index) {
      this.set(
        `details.foundMessagesFromSearch.${index}.displayMessage`,
        this.get(`details.foundMessagesFromSearch.${index}.message`)
      );
      this.set(`details.foundMessagesFromSearch.${index}.shouldShowMoreMessage`, false);
    },
    selectChannel: function (selectedChannelId) {
      this.set(
        'selectedChannel',
        this.get('details.channels').find(({ id }) => id == selectedChannelId)
      );
    },
    loadMoreSearchMessages: function () {
      if (this.get('loadingMoreMessages')) return;
      this.set('loadingMoreMessages', true);

      this.sendIntegrationMessage({
        action: 'loadMoreSearchMessages',
        data: {
          entity: this.get('block.entity'),
          channels: this.get('details.channels'),
          currentSearchResultsPage: this.get('details.currentSearchResultsPage')
        }
      })
        .then(
          ({
            foundMessagesFromSearch,
            currentSearchResultsPage,
            totalNumberOfSearchResultPages
          }) => {
            this.set(
              'details.foundMessagesFromSearch',
              this.get('details.foundMessagesFromSearch').concat(foundMessagesFromSearch)
            );
            this.set('details.currentSearchResultsPage', currentSearchResultsPage);
            this.set(
              'details.totalNumberOfSearchResultPages',
              totalNumberOfSearchResultPages
            );
            if (foundMessagesFromSearch.length === 0) {
              // no more results
              this.set('hasMoreResults', false);
            }
            if (this.get('block.userOptions.enableAvatars')) {
              this.loadAvatars();
            }
          }
        )
        .catch((err) => {
          // Remove the `... Load More` button
          this.set(
            'details.currentSearchResultsPage',
            this.get('details.totalNumberOfSearchResultPages')
          );
        })
        .finally(() => {
          this.set('loadingMoreMessages', false);
        });
    },
    sendMessage: function () {
      this.set('messagingToast', '');
      this.set('errorMessagingToast', '');
      this.set('sendingMessage', true);

      const payload = {
        action: 'sendMessage',
        data: {
          text: this.get('messageValue'),
          channel: this.get('selectedChannel').id
        }
      };

      this.sendIntegrationMessage(payload)
        .then(() => {
          this.set('messageValue', '');
          this.set('messagingToast', 'Successfully Sent Message');
        })
        .catch((err) => {
          this.set(
            'errorMessagingToast',
            'Failed to Send Message: ' +
              (err &&
                (err.detail || err.err || err.message || err.title || err.description)) ||
              'Unknown Reason'
          );
        })
        .finally(() => {
          this.set('sendingMessage', false);

          setTimeout(() => {
            if (!this.isDestroyed) {
              this.set('messagingToast', '');
              this.set('errorMessagingToast', '');
            }
          }, 5000);
        });
    }
  },
  uniqueUserIds: Ember.computed('details.foundMessagesFromSearch.length', function () {
    const userIds = this.get('details.foundMessagesFromSearch').reduce((acc, message) => {
      if (message.userId !== null) acc.push(message.userId);
      return acc;
    }, []);
    return [...new Set(userIds)];
  }),
  loadAvatars: function () {
    if (!this.get('block.userOptions.enableAvatars')) {
      return;
    }

    const uniqueUserIds = this.get('uniqueUserIds');

    // only load avatars we don't already have loaded
    const userIdsToFetch = uniqueUserIds.filter((userId) => !this.get('avatars')[userId]);

    if (userIdsToFetch.length === 0) {
      return;
    }

    const chunkArray = (arr, size) => {
      const result = [];
      for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
      }
      return result;
    };

    const userIdChunks = chunkArray(userIdsToFetch, this.maxSimultaneousAvatarLookups);

    userIdsToFetch.forEach((userId) => {
      this.get('details.foundMessagesFromSearch').forEach((message, index) => {
        if (message.userId === userId) {
          this.set(`details.foundMessagesFromSearch.${index}.__isLoadingAvatar`, true);
        }
      });
    });

    const fetchChunksSequentially = async (userIdChunks) => {
      let allAvatars = Object.assign({}, this.get('avatars'));

      for (const userIdChunk of userIdChunks) {
        const payload = {
          action: 'getUserAvatars',
          data: {
            userIds: userIdChunk
          }
        };
        const avatars = await this.sendIntegrationMessage(payload);
        allAvatars = Object.assign({}, allAvatars, avatars);
        this.set('avatars', allAvatars);

        userIdChunk.forEach((userId) => {
          this.get('details.foundMessagesFromSearch').forEach((message, index) => {
            if (message.userId === userId) {
              this.set(`details.foundMessagesFromSearch.${index}.__isLoadingAvatar`, false);
            }
          });
        });
      }
    };

    fetchChunksSequentially.call(this, userIdChunks);
  }
});
