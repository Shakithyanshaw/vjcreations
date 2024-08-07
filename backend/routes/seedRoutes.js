import express from 'express';
import Product from '../models/productModel.js';
import data from '../data.js';
import User from '../models/userModel.js';

const seedRouter = express.Router();

// Route to seed the database with initial data
seedRouter.get(`/`, async (req, res) => {
  // Delete all existing products in the database
  await Product.deleteMany({}); //In modern versions of Mongoose, you typically use deleteOne(), deleteMany(), or findOneAndDelete() methods to remove documents from the database.
  // Insert multiple products from the data file
  const createdProducts = await Product.insertMany(data.products);
  // Delete all existing users in the database
  await User.deleteMany({});
  // Insert multiple users from the data file
  const createdUsers = await User.insertMany(data.users);
  // Send the created products and users as the response
  res.send({ createdProducts, createdUsers });
});
export default seedRouter;
