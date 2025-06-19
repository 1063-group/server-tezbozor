const Order = require('../models/Order');

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { products, items, address, total, paymentMethod } = req.body;

    const rawProducts = products || items;

    // Validate required fields
    if (!rawProducts || !Array.isArray(rawProducts) || rawProducts.length === 0) {
      return res.status(400).json({ message: 'Order products cannot be empty' });
    }
    if (
      !address ||
      !address.city ||
      !address.street ||
      !address.phone ||
      address.age === undefined ||
      !address.gender
    ) {
      return res.status(400).json({
        message:
          'Address details are incomplete. city, street, phone, age, gender are required.',
      });
    }
    if (!['male', 'female'].includes(address.gender.toLowerCase())) {
      return res.status(400).json({ message: 'Gender must be either "male" or "female"' });
    }
    if (!total || total <= 0) {
      return res.status(400).json({ message: 'Total must be greater than zero' });
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: 'Payment method is required' });
    }

    const paymentMethodMap = {
      Payme: 'Online',
      Uzum: 'Online',
      Click: 'Online',
      Cash: 'Cash',
    };
    const mappedPaymentMethod = paymentMethodMap[paymentMethod];
    if (!mappedPaymentMethod) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // Transform rawProducts into order items including required street and age fields
    const orderItems = rawProducts.map((product) => ({
      productId: product.id || product.productId,
      name: product.name,
      quantity: product.basketquantity || product.quantity,
      price: product.price?.sellingPrice || product.price,
      street: address.street,
      age: address.age,
    }));

    // Validate items (now including street and age)
    for (const item of orderItems) {
      if (
        !item.productId ||
        !item.name ||
        item.quantity === undefined ||
        item.price === undefined ||
        !item.street ||
        item.age === undefined
      ) {
        return res.status(400).json({ message: 'Invalid product data' });
      }
    }

    const deliveryDetails = {
      city: address.city,
      street: address.street,
      phone: address.phone,
      age: address.age,
      gender: address.gender.toLowerCase(),
      address: `${address.city}, ${address.street}`,
      contactNumber: address.phone,
      instructions:
        address.coordinates?.lat && address.coordinates?.lon
          ? `Coordinates: ${address.coordinates.lat}, ${address.coordinates.lon}`
          : '',
      coordinates: address.coordinates || {},
    };

    const order = new Order({
      user: req.user._id,
      items: orderItems,
      total,
      paymentMethod: mappedPaymentMethod,
      deliveryDetails,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update an order
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const { items, total, status, paymentMethod, deliveryDetails } = req.body;
    if (items) order.items = items;
    if (total !== undefined) order.total = total;
    if (status) order.status = status;
    if (paymentMethod) order.paymentMethod = paymentMethod;
    if (deliveryDetails) order.deliveryDetails = deliveryDetails;

    order.updatedAt = Date.now();
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete multiple orders
const deleteOrders = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Please provide an array of order ids to delete' });
    }
    await Order.deleteMany({ _id: { $in: ids } });
    res.json({ message: 'Orders deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all orders (admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'username email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('user', 'username email');
    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

module.exports = { createOrder, updateOrder, deleteOrders, getAllOrders, getUserOrders };
