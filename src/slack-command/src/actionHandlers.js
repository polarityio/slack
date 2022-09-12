const { actions: appHomeActions } = require('./appHome');

//! Note: the path to the action handler is defined by the `block_id` for the block preforming the action
module.exports = {
  ...appHomeActions
};
