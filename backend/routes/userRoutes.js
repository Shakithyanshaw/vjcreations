import express from 'express';
import bcrypt from 'bcryptjs';
import expressAsyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { isAuth, isAdmin, generateToken } from '../utils.js';
import { sendWelcomeEmail } from '../emailwelcome.js';
import { sendProfileUpdateEmail } from '../emailprofile.js';

const userRouter = express.Router();

// Get all users - Admin only
userRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
  })
);

// Get user by ID - Authenticated users
userRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      res.send(user);
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

// Update user by ID - Admin only
userRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.mobileNo = req.body.mobileNo || user.mobileNo;
      user.city = req.body.city || user.city;
      user.address = req.body.address || user.address;
      //user.image = req.body.image || user.image;
      user.isAdmin = Boolean(req.body.isAdmin);
      const updatedUser = await user.save();
      res.send({ message: 'User Updated', user: updatedUser });
    } else {
      res.status(404).send({ message: 'User Not Found' });
    }
  })
);

// Delete user by ID - Admin only
userRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (user) {
        if (user.email === 'admin@example.com') {
          res.status(400).send({ message: 'Can Not Delete Admin User' });
          return;
        }
        await User.deleteOne({ _id: user._id }); // Use deleteOne method
        res.status(200).send({ message: 'User Deleted' });
      } else {
        res.status(404).send({ message: 'User Not Found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send({ message: 'Internal Server Error' });
    }
  })
);

// User sign-in
userRouter.post(
  `/signin`,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          mobileNo: user.mobileNo,
          city: user.city,
          address: user.address,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        });
        return;
      }
    }
    res.status(401).send({ message: 'Invalid email or password' });
  })
);

// User sign-up
userRouter.post(
  `/signup`,
  expressAsyncHandler(async (req, res) => {
    const { name, email, mobileNo, city, address, password } = req.body;

    // Check if user with the same email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).send({ message: 'Email is already registered' });
      return;
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      mobileNo,
      city,
      address,
      password: bcrypt.hashSync(password), // Hash the password before saving
    });

    // Save the new user
    const user = await newUser.save();

    // Send welcome email to the user
    sendWelcomeEmail(user.email, user.name);

    res.status(201).send({
      _id: user._id,
      name: user.name,
      email: user.email,
      mobileNo: user.mobileNo,
      city: user.city,
      address: user.address,
      isAdmin: user.isAdmin,
      token: generateToken(user),
    });
  })
);

// Update user profile - Authenticated users
userRouter.put(
  '/profile/update',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      const originalUser = { ...user._doc }; // Make a copy of the original user document
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.city = req.body.city || user.city;
      user.address = req.body.address || user.address;
      user.mobileNo = req.body.mobileNo || user.mobileNo;
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8);
      }

      const updatedUser = await user.save();

      // Determine updated fields
      const updatedFields = {};
      Object.keys(originalUser).forEach((key) => {
        if (originalUser[key] !== updatedUser[key]) {
          updatedFields[key] = updatedUser[key];
        }
      });

      // Send email notification with updated fields
      sendProfileUpdateEmail(
        updatedUser.email,
        updatedUser.name,
        updatedFields
      );

      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        mobileNo: updatedUser.mobileNo,
        city: updatedUser.city,
        address: updatedUser.address,
        token: generateToken(updatedUser),
      });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  })
);

export default userRouter;
