const {
  flow,
  filter,
  get,
  negate,
  map,
  isEmpty,
  pick,
  any,
  concat
} = require('lodash/fp');
const { getStateValueByPath, setStateValueForPath } = require('../localStateManager');

const { requestWithDefaults } = require('../request');

const addPolarityIntegrationsToState = async (slackUserId) => {
  const intSubStatePath = `${slackUserId}.slackAppHomeState.integrationSubscriptions`;
  const integrationSubscriptionsState = getStateValueByPath(intSubStatePath);
  const currentPolarityIntegrationsState = await getPolarityIntegrations(slackUserId);

  const noIntegrationStateFound = isEmpty(integrationSubscriptionsState);

  const newIntegrationSubscriptionsState = noIntegrationStateFound
    ? currentPolarityIntegrationsState
    : flow(
        filter(
          (polarityInt) =>
            !any(
              (slackHomeInt) =>
                get('integration.id', polarityInt) ===
                get('integration.id', slackHomeInt),
              integrationSubscriptionsState
            )
        ),
        concat(integrationSubscriptionsState)
      )(currentPolarityIntegrationsState);

  setStateValueForPath(intSubStatePath, newIntegrationSubscriptionsState);
};

const getPolarityIntegrations = async (slackUserId) =>
  flow(
    get('body.data'),
    filter(
      flow(pick(['attributes.description', 'attributes.subscribed']), negate(isEmpty))
    ),
    map((int) => ({
      integration: {
        id: int.id,
        name: get('attributes.name', int),
        description: get('attributes.description', int)
      },
      includeInSearch: get('attributes.subscribed', int)
    }))
  )(
    await requestWithDefaults({
      method: 'GET',
      site: 'polarity',
      route: 'v2/integrations',
      slackUserId
    })
  );
  
module.exports = addPolarityIntegrationsToState;
