const mongoose = require('mongoose');

const creditSchema = new mongoose.Schema({
  course_name: {
    type: String,
    required: true,
  },
  organization: {
    type: String,
    required: true,
  },
  total_credits: {
    type: Number,
    required: true,
  },
});

const Credit = mongoose.model('Credit', creditSchema);

module.exports = Credit;
