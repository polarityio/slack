const { getStateValueByPath } = require('../../localStateManager');
const publishUrlToManifest = require('./publishUrlToManifest');

const publishConfigManifest = async () =>{
  const polarityUrl = getStateValueByPath('config.polarityUrl');
  const polarityPortNumber = getStateValueByPath('config.portNumber');

  await publishUrlToManifest(`${polarityUrl}:${polarityPortNumber}`);
}


module.exports = publishConfigManifest;
