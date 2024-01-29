const i18n = require('i18n');

i18n.configure({
  locales: ['es', 'pt'],
  directory: __dirname + '/locales',
  objectNotation: true,
  defaultLocale: 'es',
})

module.exports = i18n;
