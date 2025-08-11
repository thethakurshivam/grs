const mongoose = require('mongoose');

const umbrellaSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const umbrella = mongoose.model('umbrella', umbrellaSchema);

module.exports = umbrella;