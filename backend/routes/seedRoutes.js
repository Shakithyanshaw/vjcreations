import express from 'express';
import Product from '../models/productModel.js';
import data from '../data.js';

const seedRouter = express.Router();

seedRouter.get(`/`, async (req, res) => {
  await Product.deleteMany({}); //In modern versions of Mongoose, you typically use deleteOne(), deleteMany(), or findOneAndDelete() methods to remove documents from the database.
  const createdProducts = await Product.insertMany(data.products);
  res.send({ createdProducts });
});
export default seedRouter;
