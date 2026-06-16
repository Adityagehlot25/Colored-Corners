const { Review, Product, User } = require('../models');

exports.addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id; // From protect middleware

    // 1. Prevent duplicate reviews (Optional, but good practice)
    const existingReview = await Review.findOne({ where: { userId, productId } });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this product.' });
    }

    // 2. Create the Review
    await Review.create({ rating, comment, userId, productId });

    // 3. Recalculate the Average Math
    const allReviews = await Review.findAll({ where: { productId } });
    const totalReviews = allReviews.length;
    const sumRatings = allReviews.reduce((acc, rev) => acc + rev.rating, 0);
    const averageRating = (sumRatings / totalReviews).toFixed(2);

    // 4. Update the Product Cache
    await Product.update(
      { averageRating, totalReviews },
      { where: { id: productId } }
    );

    res.status(201).json({ message: 'Review added successfully!' });
  } catch (error) {
    console.error('Review Error:', error);
    res.status(500).json({ message: 'Failed to submit review' });
  }
};

exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.findAll({
      where: { productId },
      include: [{ model: User, as: 'user', attributes: ['firstName', 'lastName'] }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews' });
  }
};
