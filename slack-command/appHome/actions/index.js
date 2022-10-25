const logout = require('./logout');
const toggleShowPasswordButton = require('./toggleShowPasswordButton');
const toggleIncludeInSearch = require('./toggleIncludeInSearch');
const changeUserInputStateByPath = require('./changeUserInputStateByPath');
const toggleShowPolarityCredentials = require('./toggleShowPolarityCredentials');
const changePasswordInput = require('./changePasswordInput');



module.exports = {
  appHome: {
    credentials: {
      logout,
      toggleShowPasswordButton,
      usernameInput: changeUserInputStateByPath(
        'slackAppHomeState.userPolarityCredentials.polarityUsername'
      ),
      passwordInput: changePasswordInput,
      showHideOverflowDropdown: toggleShowPolarityCredentials
    },
    integrations: {
      includeInSearchCheckbox: toggleIncludeInSearch
    }
  }
};