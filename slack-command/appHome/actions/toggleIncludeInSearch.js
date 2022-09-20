const {
  flow,
  findIndex,
  split,
  last,
  update,
  isEmpty,
  get,
  eq,
  negate
} = require('lodash/fp');
const { setStateValueForPath, getStateValueByPath } = require('../../localStateManager');

const toggleIncludeInSearch = (actionPayload) => {
  const slackUserId = get('user.id', actionPayload);
  const integrationSubscriptions = getStateValueByPath(
    `${slackUserId}.slackAppHomeState.integrationSubscriptions`
  );

  const triggeringAction = get('actions.0', actionPayload);
  const integrationIdToToggle = flow(
    get('action_id'),
    split('.'),
    last
  )(triggeringAction);

  const intSubIndexToToggle = findIndex(
    flow(get('integration.id'), eq(integrationIdToToggle)),
    integrationSubscriptions
  );

  const newIntegrationSubscriptions = update(
    intSubIndexToToggle,
    (originalIntState) => ({
      ...originalIntState,
      includeInSearch: flow(get('selected_options'), negate(isEmpty))(triggeringAction)
    }),
    integrationSubscriptions
  );

  setStateValueForPath(
    `${slackUserId}.slackAppHomeState.integrationSubscriptions`,
    newIntegrationSubscriptions
  );
};

module.exports = toggleIncludeInSearch;
