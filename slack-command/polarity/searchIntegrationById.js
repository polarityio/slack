const { get } = require('lodash/fp');
const { requestWithDefaults } = require('../request');

const searchIntegrationById = async (slackUserId, integrationId, entities) =>
  get(
    'body.data',
    await requestWithDefaults({
      method: 'POST',
      site: 'polarity',
      route: `v2/integration-lookups/${integrationId}`,
      slackUserId,
      headers: { 'Content-Type': 'application/json' },
      body: { data: { type: 'integration-lookups', attributes: { entities } } }
    })
  );

module.exports = searchIntegrationById;
