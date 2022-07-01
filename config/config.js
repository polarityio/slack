module.exports = {
  name: 'slack',
  acronym: 'SLACK',
  description: 'TODO',
  entityTypes: ['*'],
  // customTypes: [
  //   {
  //     key: 'allText',
  //     regex: /\S[\s\S]{0,256}\S/
  //   }
  // ],
  styles: ['./styles/styles.less'],
  onDemandOnly: true,
  block: {
    component: {
      file: './components/block.js'
    },
    template: {
      file: './templates/block.hbs'
    }
  },
  request: {
    cert: '',
    key: '',
    passphrase: '',
    ca: '',
    proxy: '',
    rejectUnauthorized: false
  },
  logging: {
    level: 'trace' //trace, debug, info, warn, error, fatal
  },
  options: []
};
