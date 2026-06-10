const mongoose = require('mongoose');

const aiEngineerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
    },
    expertise: {
      type: [String],
      default: [],
    },
    modelAccess: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AiEngineer', aiEngineerSchema);
