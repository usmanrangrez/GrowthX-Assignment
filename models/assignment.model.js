import mongoose from 'mongoose';
import constants from '../config/constants.js';
const { Schema } = mongoose;

const assignmentSchema = new Schema({
  user: {
    type: String,
    required: true,
  },
  admin: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  task: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: [constants.pending, constants.rejected, constants.accepted], 
    default: constants.pending
  },
  filePath: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
