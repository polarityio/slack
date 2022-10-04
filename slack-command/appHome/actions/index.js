const logout = require('./logout');
const toggleShowPasswordButton = require('./toggleShowPasswordButton');
const toggleIncludeInSearch = require('./toggleIncludeInSearch');
const changeUserInputStateByPath = require('./changeUserInputStateByPath');
const toggleShowPolarityCredentials = require('./toggleShowPolarityCredentials');



module.exports = {
  appHome: {
    credentials: {
      logout,
      toggleShowPasswordButton,
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