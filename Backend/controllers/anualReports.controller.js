const AnualReportModel = require("../models/AnualReportModel");

exports.createAnualReport = async (req, res) => {
  try {
    const { year, image, report } = req.body;

    if (!year || !image || !report) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newReport = await AnualReportModel.create({ year, image, report });
    res
      .status(201)
      .json({ message: "Anual report created successfully", data: newReport });
  } catch (error) {
    res.status(500).json({ message: "Error creating Anual report", error });
  }
};

exports.getAnualReports = async (req, res) => {
  try {
    const reports = await AnualReportModel.find();
    res.status(200).json({
      message: "Anual reports retrieved successfully",
      data: reports,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving Anual reports", error });
  }
};

exports.updateAnualReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { year, image, report } = req.body;

    if (!year || !image || !report) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const updatedReport = await AnualReportModel.findByIdAndUpdate(
      id,
      { year, image, report },
      { new: true }
    );

    if (!updatedReport) {
      return res.status(404).json({ message: "Anual report not found" });
    }

    res.status(200).json({
      message: "Anual report updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating Anual report", error });
  }
};

exports.deleteAnualReport = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedReport = await AnualReportModel.findByIdAndDelete(id);

    if (!deletedReport) {
      return res.status(404).json({ message: "Anual report not found" });
    }

    res.status(200).json({ message: "Anual report deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting Anual report", error });
  }
};
