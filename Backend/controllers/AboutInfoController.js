const AboutInfo = require('../models/AboutInfo');  // AboutInfo model import

// Create AboutInfo Data
exports.createAboutInfo = async (req, res) => {
  try {
    const newAboutInfo = new AboutInfo(req.body);
    await newAboutInfo.save();
    res.status(201).json(newAboutInfo);
  } catch (error) {
    res.status(500).json({ message: 'Error creating AboutInfo data', error });
  }
};

// Get All AboutInfo Data
exports.getAboutInfo = async (req, res) => {
  try {
    const aboutInfos = await AboutInfo.find();  // Fetch all AboutInfo from the DB
    res.status(200).json(aboutInfos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching AboutInfo data', error });
  }
};

// Update AboutInfo Data by ID
exports.updateAboutInfo = async (req, res) => {
  try {
    const aboutInfoId = req.params.id;
    const updatedAboutInfo = await AboutInfo.findByIdAndUpdate(aboutInfoId, req.body, { new: true });

    if (!updatedAboutInfo) {
      return res.status(404).json({ message: 'AboutInfo not found' });
    }

    res.status(200).json(updatedAboutInfo);
  } catch (error) {
    res.status(500).json({ message: 'Error updating AboutInfo data', error });
  }
};

// Delete AboutInfo Data by ID
exports.deleteAboutInfo = async (req, res) => {
  try {
    const aboutInfoId = req.params.id;
    const deletedAboutInfo = await AboutInfo.findByIdAndDelete(aboutInfoId);

    if (!deletedAboutInfo) {
      return res.status(404).json({ message: 'AboutInfo not found' });
    }

    res.status(200).json({ message: 'AboutInfo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting AboutInfo data', error });
  }
};
