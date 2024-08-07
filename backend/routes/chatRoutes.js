import express from 'express';
import axios from 'axios';
import Product from '../models/productModel.js';

const router = express.Router();
// Route to handle POST requests for product inquiries
router.post('/', async (req, res) => {
  const { message } = req.body;

  // Check if message is provided in the request body
  if (!message) {
    return res.status(400).send({ message: 'Message is required' });
  }
  // Keywords to search for in the message
  const keywords = ['price', 'description', 'category', 'brand', 'stock'];
  const matchedKeyword = keywords.find((keyword) =>
    message.toLowerCase().includes(keyword)
  );

  // If a keyword is matched, proceed to extract product ID and fetch details
  if (matchedKeyword) {
    const productId = extractProductId(message);
    if (!productId) {
      return res
        .status(400)
        .send({ message: 'Product ID not found in the message' });
    }

    try {
      const product = await Product.findOne({ _id: productId });

      if (!product) {
        return res.status(404).send({ message: 'Product not found' });
      }

      // Generate a response message based on the matched keyword
      let responseMessage = '';
      switch (matchedKeyword) {
        case 'price':
          responseMessage = `The price of ${product.name} is $${product.price}.`;
          break;
        case 'description':
          responseMessage = `Description of ${product.name}: ${product.description}`;
          break;
        case 'category':
          responseMessage = `${product.name} belongs to the category: ${product.category}.`;
          break;
        case 'brand':
          responseMessage = `${product.name} is from the brand: ${product.brand}.`;
          break;
        case 'stock':
          responseMessage = `${product.name} has ${product.countInStock} items in stock.`;
          break;
        default:
          responseMessage = 'I am not sure about that.';
      }
      // Send the response message
      res.send({ message: responseMessage });
    } catch (error) {
      console.error('Error fetching product details:', error);
      res.status(500).send({ message: 'Error fetching product details' });
    }
    // If no keyword is matched, ask the user to clarify
  } else {
    res.send({ message: 'I am not sure about that. Can you please clarify?' });
  }
});
// Function to extract product ID from the message
function extractProductId(message) {
  const match = message.match(/product\s(\d+)/i);
  return match ? match[1] : null;
}

export default router;
