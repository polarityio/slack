const { flow } = require('lodash');
const { replace } = require('lodash/fp');
const { getStateValueByPath } = require('../../localStateManager');
const publishUrlToManifest = require('./publishUrlToManifest');

const publishConfigManifest = async (useHttps) =>{
  const polarityUrl = useHttps
    ? getStateValueByPath('config.polarityUrl')
    : flow(getStateValueByPath, replace('https', 'http'))('config.polarityUrl');
  const polarityPortNumber = getStateValueByPath('config.portNumber');

  await publishUrlToManifest(`${polarityUrl}:${polarityPortNumber}`);
}


module.exports = publishConfigManifest;
