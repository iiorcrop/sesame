
exports.checkDuplicate = async (Model, query) => {
  const exists = await Model.exists(query);
  return !!exists;
};