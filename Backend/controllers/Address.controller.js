const Address = require("../models/Address");

exports.createAddress = async (req, res) => {
  try {
    const newAddress = new Address(req.body);
    await newAddress.save();
    res.status(201).json({
      success: true,
      data: newAddress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating address",
      error: error.message,
    });
  }
};

exports.getAddress = async (req, res) => {
  try {
    const address = await Address.find();
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }
    res.status(200).json(address);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching address",
      error: error.message,
    });
  }
};

exports.getAllAddress = exports.getAddress;

exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await Address.findByIdAndDelete(id);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }
    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting address",
      error: error.message,
    });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedAddress = await Address.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedAddress) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }
    res.status(200).json({
      success: true,
      data: updatedAddress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating address",
      error: error.message,
    });
  }
};
