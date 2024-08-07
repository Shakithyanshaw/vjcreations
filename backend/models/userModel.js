import mongoose from 'mongoose';

// Define the schema for users
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobileNo: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    isAdmin: { type: Boolean, default: false, required: true },
  },
  {
    timestamps: true, // Automatically create `createdAt` and `updatedAt` timestamps
  }
);

// Create the User model from the schema
const User = mongoose.model('User', userSchema);
export default User;
