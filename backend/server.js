import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import seedRouter from './routes/seedRoutes.js';
import productRouter from './routes/productRoutes.js';
import userRouter from './routes/userRoutes.js';
import orderRouter from './routes/orderRoutes.js';
import uploadRouter from './routes/uploadRoutes.js';
import chatRouter from './routes/chatRoutes.js';

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit process with failure
  });

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get(`/api/keys/paypal`, (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

app.use(`/api/seed`, seedRouter);
app.use(`/api/products`, productRouter);
app.use(`/api/users`, userRouter);
app.use(`/api/orders`, orderRouter);
app.use(`/api/upload`, uploadRouter);
app.use('/api/chat', chatRouter);

app.use((err, req, res, next) => {
  console.error('Error handler:', err.message);
  res.status(500).send({ message: 'Internal Server Error' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
