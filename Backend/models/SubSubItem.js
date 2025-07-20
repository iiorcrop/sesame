// models/SubSubItem.js
const mongoose = require('mongoose');

const SubSubItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  sub_parent_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'SubItem',
    required: true 
  }
});

module.exports = mongoose.model('SubSubItem', SubSubItemSchema);