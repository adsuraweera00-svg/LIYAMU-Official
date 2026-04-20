import dotenv from 'dotenv';
import { adminFirestore } from '../config/firebase.js';
import bcrypt from 'bcryptjs';

dotenv.config();
const db = adminFirestore();

const seed = async () => {
  const users = [
    {
      name: 'System Owner',
      email: 'liyamu.owner@gmail.com',
      password: await bcrypt.hash('Liyamu@0721...', 10),
      role: 'admin',
      badges: { owner: true },
      creditBalance: 10000,
      earningsBalance: 0,
      createdAt: new Date().toISOString(),
      isDeleted: false,
      isBanned: false
    }
  ];

  const userIds = {};

  for (const userData of users) {
    const snap = await db.collection('users').where('email', '==', userData.email).get();
    if (snap.empty) {
      const docRef = await db.collection('users').add(userData);
      userIds[userData.role] = docRef.id;
      console.log(`${userData.role} seeded (${userData.email})`);
    } else {
      userIds[userData.role] = snap.docs[0].id;
      console.log(`${userData.role} already exists`);
    }
  }

  const dummyBooks = [
    {
      title: "The Silent Horizon",
      author: userIds['admin'],
      category: "Science Fiction",
      documentType: "text",
      content: "The stars had gone dark...",
      coverUrl: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400",
      isFree: true,
      status: "approved",
      ratingAverage: 4.8,
      ratingCount: 1,
      viewCount: 1240,
      createdAt: new Date().toISOString()
    },
    {
      title: "Whispers of the Ancestors",
      author: userIds['admin'],
      category: "Historical Fiction",
      documentType: "pdf",
      pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      coverUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b",
      isFree: false,
      price: 12,
      status: "approved",
      ratingAverage: 4.5,
      ratingCount: 1,
      viewCount: 850,
      createdAt: new Date().toISOString()
    }
  ];

  for (const bookData of dummyBooks) {
    const snap = await db.collection('books').where('title', '==', bookData.title).get();
    if (snap.empty) {
      await db.collection('books').add(bookData);
      console.log(`Book seeded: ${bookData.title}`);
    }
  }

  console.log('Seeding complete');
  process.exit();
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
