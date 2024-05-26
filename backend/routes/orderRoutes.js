import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import { isAuth, isAdmin } from '../utils.js';

const orderRouter = express.Router();

orderRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name');
    res.send(orders);
  })
);

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
    res.status(201).send({ message: 'New Order Created', order });
  })
);

orderRouter.get(
  '/seller',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productSalesByBrand = await Order.aggregate([
      {
        $group: {
          _id: '$brand',
          totalSales: { $sum: '$sales' },
        },
      },
    ]);

    const productBrands = await Product.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 },
        },
      },
    ]);
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

orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);

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
    const CODorders = await Order.aggregate([
      {
        $match: { paymentMethod: 'Cash On Delivery' },
      },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ]);

    const users = await User.aggregate([
      {
        $group: {
          _id: null,
          numUsers: { $sum: 1 },
        },
      },
    ]);

    const usersByCity = await User.aggregate([
      {
        $group: {
          _id: '$city',
          numUsers: { $sum: 1 },
        },
      },
    ]);

    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const ordersByCity = await Order.aggregate([
      {
        $group: {
          _id: '$shippingAddress.city',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const dailyOrdersCount = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthlyOrderCount = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const yearlyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const yearlyOrderCount = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y', date: '$createdAt' } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);
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
    });
  })
);

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.send(orders);
  })
);

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
      res.send(404).send({ message: 'Order Not Found' });
    }
  })
);

orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);
      if (order) {
        await order.deleteOne(); // Use deleteOne method instead of remove
        res.status(200).send({ success: true, message: 'Order Deleted' });
      } else {
        res.status(404).send({ success: false, message: 'Order Not Found' });
      }
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .send({ success: false, message: 'Internal Server Error' });
    }
  })
);

export default orderRouter;
