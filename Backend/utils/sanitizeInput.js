 
const validator = require('validator');

exports.sanitizeInput = (str) => validator.escape(str?.trim() || '');

 

exports.normalizePhone = (number) => number.replace(/\D/g, '').slice(0, 10);

exports.stripInvisibleChars = (str) => str.replace(/[\u200B-\u200D\uFEFF]/g, '');

exports.isValidUrl = (url) => {
  return validator.isURL(url, {
    require_protocol: true, // force full URL with http/https
    protocols: ['http', 'https'],
  });
};
