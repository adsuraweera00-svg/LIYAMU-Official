import Purchase from '../models/Purchase.js';
import Book from '../models/Book.js';

export const getAuthorEarnings = async (req, res) => {
  const books = await Book.find({ author: req.user._id });
  const bookIds = books.map((b) => b._id);
  const purchases = await Purchase.find({ book: { $in: bookIds } }).populate('book', 'title price');
  const total = purchases.reduce((sum, p) => sum + p.authorEarnings, 0);
  res.json({ balance: req.user.earningsBalance, total, purchases });
};
