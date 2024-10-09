import mongoose from 'mongoose';
const { Schema } = mongoose;

const assignmentSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique:true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user' 
  }
}, {
  timestamps: true
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;
