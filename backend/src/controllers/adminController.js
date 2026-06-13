const User = require('../models/User');
const { Order } = require('../models');

exports.elevateToAdmin = async (req, res) => {
  try {
    const { targetUserId } = req.body;

    const user = await User.findByPk(targetUserId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({ message: 'User is already an Admin.' });
    }

    user.role = 'ADMIN';
    await user.save();

    res.status(200).json({ 
      message: `Success! ${user.email} has been elevated to ADMIN status.` 
    });

  } catch (error) {
    console.error('Elevation Error:', error);
    res.status(500).json({ message: 'Failed to elevate user.' });
  }
};

// 1. Get Platform Stats
exports.getPlatformStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalSellers = await User.count({ where: { role: 'SELLER' } });
    
    // Sum up all completed payments
    const salesTotal = await Order.sum('amount', { where: { status: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } });

    res.status(200).json({
      totalUsers,
      totalSellers,
      totalRevenue: salesTotal || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load stats' });
  }
};

// 2. Get All Users (For the Management Table)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'emailStatus', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// 3. Toggle User Suspension
exports.toggleUserSuspension = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      message: `User ${user.isSuspended ? 'suspended' : 'unsuspended'} successfully.`,
      user
    });
  } catch (error) {
    console.error('Suspension Error:', error);
    res.status(500).json({ message: 'Failed to update user suspension status.' });
  }
};
