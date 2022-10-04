const { getStateValueByPath } = require('../../localStateManager');
const publishUrlToManifest = require('./publishUrlToManifest');

const publishConfigManifest = async () => 
  await publishUrlToManifest(getStateValueByPath('config.polarityUrl'));


module.exports = publishConfigManifest;
