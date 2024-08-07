import mongoose from 'mongoose';

// Define the schema for reviews
const reviewSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    comment: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  {
    timestamps: true, // Automatically create `createdAt` and `updatedAt` timestamps
  }
);
// Define the schema for products
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    images: [String],
    brand: { type: String, required: true },
    type: { type: String, required: true, enum: ['product', 'service'] },
    category: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    countInStock: { type: Number, required: true },
    rating: { type: Number, required: true },
    numReviews: { type: Number, required: true },
    reviews: [reviewSchema],
  },
  {
    timestamps: true, // Automatically create `createdAt` and `updatedAt` timestamps
  }
);
// Create the Product model from the schema
const Product = mongoose.model('Product', productSchema);
export default Product;
