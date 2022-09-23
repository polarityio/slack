const { get } = require('lodash/fp');
const { requestWithDefaults } = require('../request');

const parseEntities = async (slackUserId, text) =>
  get(
    'body.data.attributes.entities',
    await requestWithDefaults({
      method: 'POST',
      site: 'polarity',
      route: 'v2/parsed-entities',
      slackUserId,
      headers: { 'Content-Type': 'application/json' },
      body: { text }
    })
  );

module.exports = parseEntities;
