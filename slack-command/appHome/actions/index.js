const logout = require('./logout');
const toggleIncludeInSearch = require('./toggleIncludeInSearch');
const changeUsernameInput = require('./changeUsernameInput');
const toggleShowPolarityCredentials = require('./toggleShowPolarityCredentials');
const changePasswordInput = require('./changePasswordInput');



module.exports = {
  appHome: {
    credentials: {
      logout,
      usernameInput: changeUsernameInput,
      passwordInput: changePasswordInput,
      showHideOverflowDropdown: toggleShowPolarityCredentials
    },
    integrations: {
      includeInSearchCheckbox: toggleIncludeInSearch
    }
  }
};