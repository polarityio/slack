const { flow, get, concat, __, compact } = require('lodash/fp');
const { requestWithDefaults } = require('./request');

const NodeCache = require('node-cache');
const channelsCache = new NodeCache({
  stdTTL: 24 * 30 * 60 // cache channels for 24 hours
});

const getSlackChannels = async (options, aggChannels, cursor) => {
  const cachedChannels = channelsCache.get('channels');
  if (cachedChannels) return cachedChannels;

  const response = await requestWithDefaults({
    method: 'GET',
    url: `${options.url}/conversations.list`,
    qs: {
      exclude_archived: true,
      types: 'public_channel, private_channel',
      limit: 999,
      ...(cursor && { cursor })
    },
    options
  });
  const channels = flow(get('body.channels'), concat(aggChannels, __), compact)(response);
  const nextCursor = get('body.response_metadata.next_cursor', response);

  if (!nextCursor) channelsCache.set('channels', channels);

  return nextCursor ? await getSlackChannels(options, channels, nextCursor) : channels;
};

module.exports = getSlackChannels;
