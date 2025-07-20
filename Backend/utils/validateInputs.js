exports.isEmptyOrWhitespace = (str) => !str || str.trim().length === 0;

exports.pickAllowedFields = (obj, allowedFields = []) => {
  const result = {};
  allowedFields.forEach((field) => {
    if (obj[field] !== undefined) result[field] = obj[field];
  });
  return result;
};