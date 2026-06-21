const { sequelize, Product, OrderItem } = require('../models');

/**
 * Atomically deducts physical stock for an order.
 * Uses row-level locking to prevent overselling if two users 
 * try to buy the same item at the exact same millisecond.
 *
 * @param {string} orderId - The UUID of the paid order
 */
exports.deductStockAtomically = async (orderId) => {
  // 1. Fetch all items associated with this order
  const itemsToDeduct = await OrderItem.findAll({ where: { orderId } });

  if (!itemsToDeduct || itemsToDeduct.length === 0) {
    throw new Error('No items found for this order.');
  }

  // 2. ANTI-DEADLOCK SORTING: 
  // If User A buys [Shirt, Pants] and User B buys [Pants, Shirt] at the same time,
  // the database can deadlock while locking rows. Sorting by ID guarantees 
  // all transactions lock rows in the exact same chronological order.
  const sortedItems = itemsToDeduct.sort((a, b) => a.productId.localeCompare(b.productId));

  // 3. Initiate the Managed Database Transaction
  const transaction = await sequelize.transaction();

  try {
    for (const item of sortedItems) {
      // 4. THE LOCK: 'transaction.LOCK.UPDATE'
      // This commands PostgreSQL to lock this specific product row. 
      // Any other concurrent checkout must wait until this transaction finishes.
      const product = await Product.findByPk(item.productId, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!product) {
        throw new Error(`Product ${item.productId} no longer exists.`);
      }

      // 5. Concurrency Check: Ensure stock hasn't dropped below requested quantity
      if (!product.isPre && product.pStock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}.`);
      }

      // 6. Safely deduct the stock
      product.pStock -= item.quantity;

      // BR-CAT-02: If stock hits zero (and it's not a pre-order), mark it Out of Stock
      if (product.pStock === 0 && !product.isPre) {
        product.status = 'OUT_OF_STOCK';
      }

      // Save the updated product within the locked transaction
      await product.save({ transaction });
    }

    // 7. Commit the transaction. The locks are now released.
    await transaction.commit();
    return true;

  } catch (error) {
    // 8. If ANY item fails (e.g. out of stock), rollback everything. 
    // No stock is deducted, ensuring data integrity.
    await transaction.rollback();
    throw error; 
  }
};