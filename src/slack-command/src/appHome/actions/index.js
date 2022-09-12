const toggleIncludeInSearch = require('./toggleIncludeInSearch');
const changeUserInputStateByPath = require('./changeUserInputStateByPath');
const toggleShowPasswordButton = require('./toggleShowPasswordButton');
const toggleShowPolarityCredentials = require('./toggleShowPolarityCredentials');



module.exports = {
  appHome: {
    credentials: {
      toggleShowPasswordButton: toggleShowPasswordButton,
      usernameInput: changeUserInputStateByPath(
        'slackAppHomeState.userPolarityCredentials.polarityUsername'
      ),
      passwordInput: changeUserInputStateByPath(
        'slackAppHomeState.userPolarityCredentials.polarityPassword'
      ),
      showHideOverflowDropdown: toggleShowPolarityCredentials
    },
    integrations: {
      includeInSearchCheckbox: toggleIncludeInSearch
    }
  }
};