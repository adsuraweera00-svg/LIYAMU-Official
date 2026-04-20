import { adminFirestore } from '../config/firebase.js';

const db = adminFirestore();

export const getAuthorEarnings = async (req, res) => {
  const booksSnapshot = await db.collection('books').where('author', '==', req.user.id).get();
  const bookIds = booksSnapshot.docs.map(doc => doc.id);
  
  if (bookIds.length === 0) {
    return res.json({ balance: req.user.earningsBalance || 0, total: 0, purchases: [] });
  }

  const purchasesSnapshot = await db.collection('purchases').where('book', 'in', bookIds).get();
  let total = 0;
  const purchases = purchasesSnapshot.docs.map(doc => {
    const data = doc.data();
    total += (data.authorEarnings || 0);
    return { id: doc.id, ...data };
  });

  res.json({ balance: req.user.earningsBalance || 0, total, purchases });
};
