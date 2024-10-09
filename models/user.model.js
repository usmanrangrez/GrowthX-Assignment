import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
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

const User = mongoose.model('User', userSchema);

export default User;
