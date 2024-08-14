import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAuth, isAdmin } from '../utils.js';
import { sendOrderConfirmationEmail } from '../emailService.js';
import { sendOrderDeletionEmail } from '../sendOrderDeletionEmail.js';

const orderRouter = express.Router();

// Route to get all orders. Accessible only to authenticated admins.
orderRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name');
    res.send(orders);
  })
);

// Route to check product availability based on order count for a specific date
orderRouter.post(
  '/check-availability',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { productId, selectedDate } = req.body;

    // Ensure selectedDate is in the correct format, e.g., YYYY-MM-DD
    const date = new Date(selectedDate);
    if (isNaN(date.getTime())) {
      return res.status(400).send({ message: 'Invalid date format' });
    }

    // Count how many times the user has ordered the same product on the selected date
    const count = await Order.countDocuments({
      'orderItems.product': productId,
      deliveredAt: {
        $gte: date,
        $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      },
      user: req.user._id,
    });

    if (count >= 3) {
      res.send({ isAvailable: false });
    } else {
      res.send({ isAvailable: true });
    }
  })
);

//Route to create a new order. Accessible only to authenticated users.
orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,
      shippingPrice: req.body.shippingPrice,
      taxPrice: req.body.taxPrice,
      totalPrice: req.body.totalPrice,
      user: req.user._id,
    });

    const order = await newOrder.save();
    // After creating the order, send confirmation email
    await sendOrderConfirmationEmail(req.user.email, req.user.name, newOrder);
    res.status(201).send({ message: 'New Order Created', order });
  })
);

//Route to get sales and order statistics for sellers. Accessible only to authenticated admins.
orderRouter.get(
  '/seller',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    // Aggregate data to get total sales by brand
    const productSalesByBrand = await Order.aggregate([
      {
        $group: {
          _id: '$brand',
          totalSales: { $sum: '$sales' },
        },
      },
    ]);
    // Aggregate data to get the count of products by brand
    const productBrands = await Product.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 },
        },
      },
    ]);
    // Aggregate data to get the total sales by brand from order items
    const salesByBrand = await Order.aggregate([
      {
        $unwind: '$orderItems',
      },
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: '$product',
      },
      {
        $group: {
          _id: '$product.brand',
          sales: { $sum: '$orderItems.quantity' },
        },
      },
    ]);
    // Aggregate data to get total sales by brand from product orders
    const brandSales = await Product.aggregate([
      {
        $lookup: {
          from: 'orders',
          localField: '_id',
          foreignField: 'orderItems.product',
          as: 'orders',
        },
      },
      {
        $unwind: '$orders',
      },
      {
        $group: {
          _id: '$brand',
          totalSales: { $sum: '$orders.totalPrice' },
        },
      },
    ]);
    // Aggregate data to get total sales and details of orders by brand
    const ordersByBrand = await Order.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'orderItems.product',
          foreignField: '_id',
          as: 'products',
        },
      },
      {
        $unwind: '$products',
      },
      {
        $group: {
          _id: '$products.brand',
          totalSales: { $sum: '$totalPrice' },
          orders: {
            $push: {
              orderId: '$_id',
              user: '$user',
              date: '$createdAt',
              items: '$orderItems',
            },
          },
        },
      },
    ]);

    res.send({
      productBrands,
      productSalesByBrand,
      salesByBrand,
      brandSales,
      ordersByBrand,
    });
  })
);

/**
 * Route to get a summary of orders, payments, and users.
 * Accessible only to authenticated admins.
 */

orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    // Aggregate data to get total number of orders and total sales
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    // Aggregate data to get undelivered orders
    const UndeliverdOrders = await Order.aggregate([
      {
        $match: {
          isDelivered: false, // filter documents where isDelivered is false
        },
      },
      {
        $group: {
          _id: null,
          numDOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    // Aggregate data to get unpaid orders
    const UnPaidOrders = await Order.aggregate([
      {
        $match: {
          isPaid: false, // filter documents where isPaid is false
        },
      },
      {
        $group: {
          _id: null,
          numPOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    // Aggregate data to get orders and sales by payment method (PayPal)
    const Paypalorders = await Order.aggregate([
      {
        $match: { paymentMethod: 'PayPal' },
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    // Aggregate data to get orders and sales by payment method (COD)
    const CODorders = await Order.aggregate([
      {
        $match: { paymentMethod: 'COD' },
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);
    // Aggregate data to get the total number of users
    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);
    // Aggregate data to get the number of users by city
    const usersByCity = await User.aggregate([
      {
        $group: {
          _id: '$city',
          numUsers: { $sum: 1 },
        },
      },
    ]);
    // Aggregate data to get daily orders and sales
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date in ascending order
    ]);
    // Aggregate data to get the number of orders by shipping city
    const ordersByCity = await Order.aggregate([
      {
        $group: {
          _id: '$shippingAddress.city',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } }, // Sort by count in descending order
    ]);
    // Aggregate data to get daily order count
    const dailyOrdersCount = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by date in ascending order
    ]);
    // Aggregate data to get monthly orders and sales
    const monthlyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } }, // Sort by month in ascending order
    ]);
    // Aggregate data to get monthly order count
    const monthlyOrderCount = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by month in ascending order
    ]);
    // Aggregate data to get yearly orders and sales
    const yearlyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } }, // Aggregate data to get yearly order count
    ]);
    // Aggregate data to get yearly order count
    const yearlyOrderCount = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y', date: '$createdAt' } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } }, // Sort by year in ascending order
    ]);
    // Aggregate data to get product categories and their counts
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
    // Aggregate data to get top-selling products
    const topSellingProducts = await Order.aggregate([
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          totalSales: { $sum: '$totalPrice' },
          productName: { $first: '$orderItems.name' },
        },
      },
      { $sort: { totalSales: -1 } },
      { $limit: 10 },
    ]);
    // Aggregate data to get monthly COD orders
    const monthlyCODOrders = await Order.aggregate([
      {
        $match: {
          paymentMethod: 'COD',
          createdAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.send({
      users,
      orders,
      Paypalorders,
      CODorders,
      dailyOrders,
      monthlyOrders,
      UnPaidOrders,
      UndeliverdOrders,
      dailyOrdersCount,
      yearlyOrders,
      productCategories,
      monthlyOrderCount,
      ordersByCity,
      usersByCity,
      yearlyOrderCount,
      topSellingProducts,
      monthlyCODOrders,
    });
  })
);

/**
 * Route to get the logged-in user's orders.
 * Accessible only to authenticated users.
 */
orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

/**
 * Route to get a specific order by ID.
 * Accessible only to authenticated users.
 */
orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.send(order);
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

/**
 * Route to mark an order as delivered.
 * Accessible only to authenticated users.
 */
orderRouter.put(
  '/:id/deliver',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      await order.save();
      res.send({ message: 'Order Delivered' });
    } else {
      res.status(404).send({ message: 'Order Not Found' });
    }
  })
);

/**
 * Route to mark an order as paid (cash payment).
 * Accessible only to authenticated users.
 */
orderRouter.put(
  '/:id/paycash',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        const updatedOrder = await order.save();
        res.send({ message: 'Order Paid', order: updatedOrder });
      } else {
        res.status(404).send({ message: 'Order Not Found' });
      }
    } catch (error) {
      res
        .status(500)
        .send({ message: 'Error in updating order', error: error.message });
    }
  })
);

/**
 * Route to mark an order as paid (online payment).
 * Accessible only to authenticated users.
 */
orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.email_address,
      };
      const updateOrder = await order.save();
      res.send({ message: 'Order Paid', order: updateOrder });
    } else {
      // After updating the order, send confirmation email
      await sendOrderConfirmationEmail(req.user.email, req.user.name, order);
      res.send(404).send({ message: 'Order Not Found' });
    }
  })
);

/**
 * Route to delete an order.
 * Accessible only to authenticated admins.
 */
orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (order) {
        // Find the user associated with the order
        const user = await User.findById(order.user);
        if (user) {
          // Send deletion email to the user who made the order
          await sendOrderDeletionEmail(user.email, user.name, order);
        } else {
          console.error('User not found for order:', order._id);
        }

        // Delete the order
        await order.deleteOne();

        res.status(200).send({ success: true, message: 'Order Deleted' });
      } else {
        res.status(404).send({ success: false, message: 'Order Not Found' });
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      res
        .status(500)
        .send({ success: false, message: 'Internal Server Error' });
    }
  })
);

export default orderRouter;
