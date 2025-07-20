const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Address = mongoose.model("Address", addressSchema);

module.exports = Address;
