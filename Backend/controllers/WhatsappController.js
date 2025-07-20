const WhatsappNumber = require("../models/WhatsappNumber");

const UpdateWhatsappNumber = async (req, res) => {
  const { id } = req.params;
  const { number } = req.body;

  try {
    const updatedNumber = await WhatsappNumber.findByIdAndUpdate(
      id,
      { number },
      { new: true, runValidators: true }
    );

    if (!updatedNumber) {
      return res.status(404).json({ message: "Whatsapp number not found" });
    }

    res.status(200).json({ message: "Whatsapp number updated successfully" });
  } catch (error) {
    console.error("Error updating Whatsapp number:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const GetWhatsappNumber = async (req, res) => {
  try {
    const whatsappNumbers = await WhatsappNumber.find();
    res.status(200).json(whatsappNumbers);
  } catch (error) {
    console.error("Error fetching Whatsapp numbers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  UpdateWhatsappNumber,
  GetWhatsappNumber,
};
