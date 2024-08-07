import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import { isAuth, isAdmin } from '../utils.js';
import Product from '../models/productModel.js';

const productRouter = express.Router();

// Route to get all products
productRouter.get(
  `/`,
  expressAsyncHandler(async (req, res) => {
    const products = await Product.find();
    res.send(products);
  })
);

// Route to create a new product (admin only)
productRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      // Validate and handle errors for the 'type' field
      const allowedTypes = ['product', 'service'];
      if (!req.body.type || !allowedTypes.includes(req.body.type)) {
        return res
          .status(400)
          .send({ message: 'Invalid or missing product type' });
      }
      // Create a new product with default values and the provided 'type'
      const newProduct = new Product({
        name: 'Name ' + Date.now(),
        slug: 'Name-' + Date.now(),
        image: '/images/p1.jpg',
        price: 0,
        category: 'Category',
        brand: 'Brand',
        type: req.body.type, // Ensure 'type' is included in the request body
        countInStock: 0,
        rating: 0,
        numReviews: 0,
        description: 'Description',
      });
      const product = await newProduct.save();
      res.status(201).send({ message: 'Product Created', product });
    } catch (error) {
      console.error('Error creating product:', error); // Log the error
      res.status(500).send({ message: error.message });
    }
  })
);

// Route to update an existing product (admin only)
productRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      // Validate and handle errors for the 'type' field
      const allowedTypes = ['product', 'service'];
      if (!req.body.type || !allowedTypes.includes(req.body.type)) {
        return res
          .status(400)
          .send({ message: 'Invalid or missing product type' });
      }
      product.name = req.body.name;
      product.slug = req.body.slug;
      product.price = req.body.price;
      product.image = req.body.image;
      product.images = req.body.images;
      product.category = req.body.category;
      product.brand = req.body.brand;
      product.type = req.body.type;
      product.countInStock = req.body.countInStock;
      product.description = req.body.description;
      await product.save();
      res.send({ message: 'Product Updated' });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

// Route to delete a product (admin only)
productRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      await product.deleteOne(); // Use deleteOne method instead of remove
      res.status(200).send({ success: true, message: 'Product Deleted' });
    } else {
      res.status(404).send({ success: false, message: 'Product Not Found' });
    }
  })
);

// Route to add a review to a product
productRouter.post(
  '/:id/reviews',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (product) {
      // Check if product.reviews is defined before calling find
      if (
        product.reviews &&
        product.reviews.find((x) => x.name === req.user.name)
      ) {
        return res
          .status(400)
          .send({ message: 'You already submitted a review' });
      }

      const review = {
        name: req.user.name,
        rating: Number(req.body.rating),
        comment: req.body.comment,
      };
      // Handle the case where product.reviews is undefined
      if (!product.reviews) {
        product.reviews = [];
      }
      product.reviews.push(review); // Add the new review to the product
      product.numReviews = product.reviews.length; // Update the number of reviews
      product.rating =
        product.reviews.reduce((a, c) => c.rating + a, 0) /
        product.reviews.length; // Update the average rating
      const updatedProduct = await product.save();
      res.status(201).send({
        message: 'Review Created',
        review: updatedProduct.reviews[updatedProduct.reviews.length - 1],
        numReviews: product.numReviews,
        rating: product.rating,
      });
    } else {
      res.status(404).send({ message: 'Product Not Found' });
    }
  })
);

const PAGE_SIZE = 8;

// Route to get products for admin with pagination
productRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const page = query.page || 1;
    const pageSize = query.pageSize || PAGE_SIZE;

    const products = await Product.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize);
    const countProducts = await Product.countDocuments();
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

// Route to search for products with filters and pagination
productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req;
    const pageSize = query.pageSize || PAGE_SIZE;
    const page = query.page || 1;
    const category = query.category || '';
    const price = query.price || '';
    const rating = query.rating || '';
    const order = query.order || '';
    const searchQuery = query.query || '';

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {};
    const categoryFilter = category && category !== 'all' ? { category } : {};
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {};
    const priceFilter =
      price && price !== 'all'
        ? {
            // 1-50
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {};
    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 };

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize);

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    });
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    });
  })
);

// Route to get all distinct categories
productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category');
    res.send(categories);
  })
);

// Route to get a product by its slug
productRouter.get(`/slug/:slug`, async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product not found' });
  }
});

// Route to get a product by its ID
productRouter.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    res.send(product);
  } else {
    res.status(404).send({ message: 'Product not found' });
  }
});

export default productRouter;
