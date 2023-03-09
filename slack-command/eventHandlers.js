const { handleEventAppHomeOpened } = require('./appHome');

//!NOTE: Top level key must correspond to `/events` req.body.event.type string for action to run
module.exports = {
  app_home_opened: handleEventAppHomeOpened
};
