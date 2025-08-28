const { get, map, flow, filter, toInteger, size, multiply, split } = require('lodash/fp');
const { DateTime, Duration } = require('luxon');
const { RetryRequestError } = require('./errors');
const { requestWithDefaults } = require('./request');

const searchMessages = async (entities, options, currentSearchResultsPage = 1) =>
  await Promise.all(
    map(async (entity) => {
      const [sort, sort_dir] = flow(get('sortBy.value'), split(','))(options);

      const channelsToSearch = options.slackChannelsToSearch
        .split(',')
        .map((channel) => channel.trim())
        .filter((channel) => !!channel);

      const query = createQuery(entity, channelsToSearch, options);
      let foundMessages;
      try {
        foundMessages = get(
          'body.messages',
          await requestWithDefaults({
            url: `${options.url}/search.messages`,
            method: 'GET',
            qs: {
              query,
              count: 100,
              page: currentSearchResultsPage,
              sort,
              sort_dir
            },
            options,
            retryOnLimit: true
          })
        );
      } catch (error) {
        // check to see if we hit a search limit due to API rate limits
        // If so, we want to display a button to the user to manually retry the search
        if (error instanceof RetryRequestError) {
          return {
            entity,
            foundMessagesFromSearch: [],
            totalNumberOfSearchResultPages: 0,
            currentSearchResultsPage: 0,
            totalCount: 0,
            apiLimitReached: true
          };
        } else {
          throw error;
        }
      }

      const totalNumberOfSearchResultPages = flow(get('pagination.page_count'))(
        foundMessages
      );

      const totalCount = flow(get('pagination.total_count'))(foundMessages);

      let searchPermission = options.searchPermissions.value;
      const filterMethod =
        // Only use a filter if there are no channels to search set
        channelsToSearch.length > 0
          ? null
          : searchPermission === 'public'
          ? isPublicChannel
          : searchPermission === 'publicPrivate'
          ? isPublicPrivateChannel
          : searchPermission === 'private'
          ? isPrivateChannel
          : null;

      if (!filterMethod && channelsToSearch.length === 0) {
        throw new Error('Invalid search permissions set as integration option');
      }

      const foundMessagesAfterFiltering = foundMessages.matches.filter((match) => {
        if (filterMethod) {
          return filterMethod(match.channel);
        }
        return true;
      });

      if (
        size(foundMessages) === 0 &&
        size(foundMessagesAfterFiltering) > 0 &&
        currentSearchResultsPage < totalNumberOfSearchResultPages &&
        currentSearchResultsPage < 100
      ) {
        return searchMessages(entities, options, currentSearchResultsPage + 1);
      }

      const foundMessagesFromSearch = flow(
        map(formatMessagesForUi),
        filter(get('message'))
      )(foundMessagesAfterFiltering);

      return {
        entity,
        foundMessagesFromSearch,
        totalNumberOfSearchResultPages,
        currentSearchResultsPage,
        totalCount,
        apiLimitReached: false
      };
    }, entities)
  );

/**
 * Return today's date minus a time window, formatted as YYYY-MM-DD.
 *
 * @param {string|object} timeWindow - ISO-8601 duration (e.g., "P3D", "PT2H30M")
 *                                     or a Duration-like object, e.g. { days: 3 }.
 * @param {object} [options]
 * @param {string} [options.zone='utc'] - Time zone (e.g., 'utc', 'local', 'America/New_York').
 * @returns {string} e.g., "2024-01-30"
 */
function nowMinusDate(timeWindow, { zone = 'utc' } = {}) {
  const duration =
    typeof timeWindow === 'string'
      ? Duration.fromISO(timeWindow)
      : Duration.fromObject(timeWindow || {});

  if (!duration.isValid) {
    throw new Error(
      `Invalid duration. Use ISO-8601 (e.g., "P3D", "PT2H30M") or an object like { days: 3 }.`
    );
  }

  return DateTime.now().setZone(zone).minus(duration).toFormat('yyyy-MM-dd');
}

function createQuery(entity, channelsToSearch, options) {
  let query = entity.value + ' ';

  if (channelsToSearch.length > 0) {
    const channelsToSearchSyntax = channelsToSearch.map(
      (channel) => `in:${channel.trim()} `
    );
    query += channelsToSearchSyntax.join(' ');
  }

  if (options.searchWindow.value !== 'P0D') {
    query += ` after:${nowMinusDate(options.searchWindow.value)}`;
  }

  return query;
}

/**
 * Returns true if the provided channel object is a public channel
 * Returns false if the channel is private (is_private), is a multi-user direct message (is_mpim)
 * is a group (is_group), or is a direct message (is_im).
 * @param channel
 * @returns {*|boolean}
 */
function isPublicChannel(channel) {
  return (
    channel &&
    channel.is_channel &&
    !channel.is_private &&
    !channel.is_mpim &&
    !channel.is_group &&
    !channel.is_im
  );
}

/**
 * Returns true if the provided channel object is a public or private channel
 * Returns false if the channel is a multi-user direct message (is_mpim)
 * is a group (is_group), or is a direct message (is_im).
 * @param channel
 * @returns {*|boolean}
 */
function isPrivateChannel(channel) {
  return (
    channel &&
    channel.is_channel &&
    channel.is_private &&
    !channel.is_mpim &&
    !channel.is_group &&
    !channel.is_im
  );
}

/**
 * Returns true if the provided channel object is a public or private channel
 * Returns false if the channel is a multi-user direct message (is_mpim)
 * is a group (is_group), or is a direct message (is_im).
 * @param channel
 * @returns {*|boolean}
 */
function isPublicPrivateChannel(channel) {
  return (
    channel &&
    channel.is_channel &&
    !channel.is_mpim &&
    !channel.is_group &&
    !channel.is_im
  );
}

const formatMessagesForUi = (message) => ({
  messageLink: get('permalink', message),
  channelName: get('channel.name', message),
  datetime: flow(
    get('ts'),
    toInteger,
    multiply(1000),
    (unixDate) => new Date(unixDate)
  )(message),
  channelIsPrivate: get('channel.is_private', message),
  username: get('username', message),
  userId: get('user', message),
  message: get('text', message),
  displayMessage:
    flow(get('text'), (x) => x.slice(0, 120))(message) +
    (flow(get('text'), size)(message) > 120 ? '...' : ''),
  shouldShowMoreMessage: flow(get('text'), size)(message) > 120
});

module.exports = searchMessages;
