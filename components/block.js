polarity.export = PolarityComponent.extend({
  details: Ember.computed.alias('block.data.details'),
  timezone: Ember.computed('Intl', function () {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }),
  maxSimultaneousAvatarLookups: 5,
  messageValue: '',
  sendingMessage: false,
  flashMessages: Ember.inject.service('flashMessages'),
  messagingToast: '',
  errorMessagingToast: '',
  selectedChannel: {},
  foundMessageSearchResultsOpen: false,
  loadingMoreMessages: false,
  channelsToSendTo: Ember.computed.alias('details.channelsToSendTo'),
  errorTitle: '',
  errorMessage: '',
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
    retrySearch: function () {
      this.set('runningSearch', true);
      console.info('Running Search');
      this.sendIntegrationMessage({
        action: 'retryDoLookup',
        data: {
          entity: this.get('block.entity')
        }
      })
        .then((lookupResult) => {
          this.set('block.data', lookupResult.data);
        })
        .catch((err) => {
          console.error('Error retrying search', JSON.stringify(err, null, 2));

          this.flashMessage(err.detail ? err.detail : 'Error retrying search', 'danger');
        })
        .finally(() => {
          this.set('runningSearch', false);
        });
    },
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
      this.set('apiLimitReachedOnMoreMessages', false);
      
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
            totalNumberOfSearchResultPages,
            apiLimitReached
          }) => {
            if(apiLimitReached){
              this.set('apiLimitReachedOnMoreMessages', true);
            } else {
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
          }
        )
        .catch((err) => {
          // Remove the `... Load More` button
          this.set(
            'details.currentSearchResultsPage',
            this.get('details.totalNumberOfSearchResultPages')
          );
          this.flashMessage('Error fetching messages', 'danger');
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
          let message =
            'Failed to Send Message: ' +
              (err &&
                (err.detail || err.err || err.message || err.title || err.description)) ||
            'Unknown Reason';
          this.set('errorMessagingToast', message);
          this.flashMessage(message, 'danger');
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
  loadAvatars: async function () {
    if (
      !this.get('block.userOptions.enableAvatars') ||
      this.get('loadingAvatarsFailed')
    ) {
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
              this.set(
                `details.foundMessagesFromSearch.${index}.__isLoadingAvatar`,
                false
              );
            }
          });
        });
      }
    };

    try {
      await fetchChunksSequentially.call(this, userIdChunks);
    } catch (error) {
      console.error('Error loading avatars', error);
      this.flashMessage(
        error.detail ? `Error Loading Avatars: ${error.detail}` : 'Error loading avatars',
        'danger'
      );
      this.get('details.foundMessagesFromSearch').forEach((message, index) => {
        this.set(`details.foundMessagesFromSearch.${index}.__isLoadingAvatar`, false);
      });
      this.set('loadingAvatarsFailed', true);
    }
  },
  /**
   * Flash a message on the screen for a specific issue
   * @param message
   * @param type 'info', 'danger', or 'success'
   */
  flashMessage(message, type = 'info', duration = 3000) {
    console.error('Flashing message: ', message);
    this.flashMessages.add({
      message: `${this.block.acronym}: ${message}`,
      type: `unv-${type}`,
      icon:
        type === 'success'
          ? 'check-circle'
          : type === 'danger'
          ? 'exclamation-circle'
          : 'info-circle',
      timeout: duration
    });
  }
});
