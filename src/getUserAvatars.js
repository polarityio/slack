const { requestWithDefaults } = require('./request');
const NodeCache = require('node-cache');
const async = require('async');
const {
  logging: { getLogger }
} = require('polarity-integration-utils');
const { RetryRequestError } = require('./errors');

const profilePictureCache = new NodeCache({
  stdTTL: 24 * 60 * 60 //Cache profile picture for 24 hours
});

/**
 * Returns the given user's profile link from the cache if available, otherwise
 * fetches it using the `users.profile.get` API endpoint.
 *
 * https://api.slack.com/methods/users.profile.get
 *
 * Note that this endpoint is Tier 4 endpoint which has the highest rate limit and
 * should not interfere as much with the search endpoint.
 *
 * @param userIds
 * @param options
 * @returns {Promise<*>}
 */
async function getUserAvatars({ userIds }, options) {
  const Logger = getLogger();
  const userIdsToFetch = [];
  const avatars = {};

  Logger.trace({ userIds }, 'getUserAvatars');

  userIds.forEach((userId) => {
    // It is possible for a message to have a `null` user so we guard against that here
    if (userId) {
      if (profilePictureCache.has(userId)) {
        avatars[userId] = {
          apiLimitReached: false,
          avatarUrl: profilePictureCache.get(userId)
        };
      } else {
        userIdsToFetch.push(userId);
      }
    }
  });

  if (userIdsToFetch.length === 0) {
    return avatars;
  }

  await async.eachLimit(userIdsToFetch, 1, async (userId) => {
    const fetchedAvatar = await fetchSingleAvatar(userId, options);
    avatars[userId] = fetchedAvatar;
  });

  Logger.trace({ avatars }, 'result of getUserAvatars');

  return avatars;
}

async function fetchSingleAvatar(userId, options) {
  const Logger = getLogger();
  const requestOptions = {
    url: `${options.url}/users.profile.get`,
    method: 'GET',
    qs: {
      user: userId
    },
    options
  };

  try {
    const response = await requestWithDefaults(requestOptions);
    const avatarLink = response.body?.profile?.image_72;
    profilePictureCache.set(userId, avatarLink);
    return {
      avatarUrl: avatarLink,
      apiLimitReached: false
    };
  } catch (error) {
    Logger.error({error}, 'Get Avatar Error');
    if (error instanceof RetryRequestError) {
      // hit a request limit so we just return
      return {
        avatarUrl: null,
        apiLimitReached: true
      };
    } else {
      throw error;
    }
  }
}

module.exports = getUserAvatars;
