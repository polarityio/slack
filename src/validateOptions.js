const { isEmpty, keys } = require('lodash/fp');
const reduce = require('lodash/fp/reduce').convert({ cap: false });
const getSlackChannels = require('./getSlackChannels');

const validateOptions = (requestWithDefaults) => async (options, callback) => {
  const stringOptionsErrorMessages = {
    url: 'You must provide a valid Slack URL',
    userToken: 'You must provide a valid Slack User Token',
    botToken: 'You must provide a valid Slack Bot Token'
  };

  const stringValidationErrors = _validateStringOptions(
    stringOptionsErrorMessages,
    options
  );

  const urlValidationErrors = _validateUrlOption(options.url);

  let errors = stringValidationErrors.concat(urlValidationErrors);
  
  //TODO: channel option validation for a comma separated list with no spaces in channel name, and that channel names can be found in the channel list
  
  // if (!errors.length) {
  //   const formattedOptions = reduce(
  //     (agg, key) => ({ ...agg, [key]: get([key, 'value'], options) }),
  //     {},
  //     keys(options)
  //   );

  //   const allMessageableChannels = await getSlackChannels(
  //     formattedOptions,
  //     requestWithDefaults,
  //     Logger
  //   ).catch((error) => {
  //     errors = [
  //       {
  //         key: 'userToken',
  //         message: `Auth Failed: ${ERROR_MESSAGES[error.statusCode]}`
  //       }
  //     ];
  //   });
  //
  //  const asdf = filter(canSendMessagesInThisChannel, allMessageableChannels);
  //   //TODO: add allMessageableChannels to config.js and send error message saying to restart the app and try your creds again
  //   //TODO: add this back when bandwidth is available to change the comma separated channel names list, to a searchable multi-select.
  // }

  callback(null, errors);
};

const canSendMessagesInThisChannel = ({ is_private, is_member }) =>
  !(is_private && !is_member);

const _validateStringOptions = (stringOptionsErrorMessages, options, otherErrors = []) =>
  reduce((agg, message, optionName) => {
    const isString = typeof options[optionName].value === 'string';
    const isEmptyString = isString && isEmpty(options[optionName].value);

    return !isString || isEmptyString
      ? agg.concat({
          key: optionName,
          message
        })
      : agg;
  }, otherErrors)(stringOptionsErrorMessages);

const _validateUrlOption = ({ value: url }, otherErrors = []) => {
  const endWithError =
    url && url.endsWith('//')
      ? otherErrors.concat({
          key: 'url',
          message: 'Your Url must not end with a //'
        })
      : otherErrors;
  if (endWithError.length) return endWithError;

  if (url) {
    try {
      new URL(url);
    } catch (_) {
      return otherErrors.concat({
        key: 'url',
        message:
          'What is currently provided is not a valid URL. You must provide a valid Instance URL.'
      });
    }
  }

  return otherErrors;
};

module.exports = validateOptions;
