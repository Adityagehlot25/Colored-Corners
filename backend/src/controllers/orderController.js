const { Order, OrderItem, Product, User } = require('../models');

exports.getSellerOrders = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const currentUserRole = req.user.role; // e.g., 'SELLER' or 'ADMIN'

    // Build the dynamic product filter: Admins see all, Sellers see only their own
    const productFilter = currentUserRole === 'ADMIN' ? {} : { sellerId: currentUserId };

    const orders = await Order.findAll({
      where: { status: ['PAID', 'PROCESSING', 'SHIPPED'] },
      include: [
        { 
          model: User, 
          as: 'user', 
          attributes: ['id', 'email', 'firstName', 'lastName'] 
        },
        { 
          model: OrderItem, 
          as: 'items',
          required: true, // CRITICAL: Only return the Order if it contains items matching the product filter below
          include: [{ 
            model: Product, 
            as: 'product', 
            where: productFilter, // The Isolation Filter
            attributes: ['name', 'sku', 'imgs', 'sellerId'] 
          }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json(orders);
  } catch (error) {
    console.error("Fetch Orders Error:", error);
    res.status(500).json({ msg: 'Failed to fetch orders' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: newStatus, carrier, trackingId } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    // BR-ORD-01: Strict Finite State Machine (FSM)
    // Defines exactly which states can transition to which next states
    const validTransitions = {
      'PENDING': ['PAID', 'CANCELLED'],
      'PAID': ['PROCESSING', 'SHIPPED', 'CANCELLED'],
      'PROCESSING': ['SHIPPED', 'CANCELLED'],
      'SHIPPED': ['DELIVERED', 'CANCELLED'],
      'DELIVERED': [], // Terminal state
      'CANCELLED': []  // Terminal state
    };

    // Prevent illegal transitions (e.g., DELIVERED -> PENDING)
    if (!validTransitions[order.status].includes(newStatus)) {
      return res.status(400).json({ 
        msg: `Illegal state transition. Cannot move from ${order.status} to ${newStatus}.` 
      });
    }

    order.status = newStatus;
    
    // Only update tracking info if the order is actually being shipped
    if (newStatus === 'SHIPPED') {
      if (carrier) order.carrier = carrier;
      if (trackingId) order.trackingId = trackingId;
    }

    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ msg: 'Failed to update order status' });
  }
};

// 3. CUSTOMER: Fetch personal order history
exports.getCustomerOrders = async (req, res) => {
  try {
    const currentUserId = req.user.id; // Extracted safely from JWT via protect middleware

    const orders = await Order.findAll({
      where: { userId: currentUserId },
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'category', 'imgs'],
            },
          ],
        },
      ],
      order: [['createdAt', 'DESC']], // Newest orders first
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching customer order history:', error);
    res.status(500).json({ message: 'Failed to retrieve your order history.' });
  }
};