const SocialMedia = require('../models/SocialMedia');
const { checkDuplicate } = require('../utils/checkDuplicate');
const { pickAllowedFields } = require('../utils/validateInputs');

exports.socialMediaActionHandler = async (req, res) => {
  try {
    const { action, id, data } = req.body;

    switch (action) {
      case 'create': {
        const exists = await checkDuplicate(SocialMedia, { platform: data.platform });
        if (exists) return res.status(409).json({ message: 'Platform already exists.' });

        const newEntry = await SocialMedia.create(data);
        return res.status(201).json({ message: 'Component created.', data: newEntry });
      }

      case 'update': {
        if (!id) return res.status(400).json({ message: 'Missing ID for update' });
        const updated = await SocialMedia.findOneAndUpdate(
          { _id: id, isDeleted: { $ne: true } },
          pickAllowedFields(data, ['platform', 'icon', 'value']),
          { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Component not found or deleted' });
        return res.json({ message: 'Component updated', data: updated });
      }

      case 'delete': {
           if (!id) return res.status(400).json({ message: 'Missing ID for permanent deletion' });
        const removed = await SocialMedia.findByIdAndDelete(id);
        if (!removed) return res.status(404).json({ message: 'Component not found' });
        return res.json({ message: 'Component permanently deleted' });
      }

   

      case 'getAll': {
        const all = await SocialMedia.find({ isDeleted: { $ne: true } });
        return res.json({ data: all });
      }

      default:
        return res.status(400).json({ message: 'Invalid action' });
    }
  } catch (err) {
    console.error('[socialMediaActionHandler] Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
