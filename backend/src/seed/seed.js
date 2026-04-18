import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Book from '../models/Book.js';

dotenv.config();
await connectDB();

const users = [
  {
    name: 'Admin User',
    email: process.env.ADMIN_SEED_EMAIL || 'admin@liyamu.com',
    password: process.env.ADMIN_SEED_PASSWORD || 'Admin@12345',
    role: 'admin',
    badges: { owner: true }
  },
  {
    name: 'Demo Author',
    email: 'author@demo.com',
    password: 'password123',
    role: 'author',
    badges: { author: true, verifiedAuthor: true }
  },
  {
    name: 'Demo Reader',
    email: 'reader@demo.com',
    password: 'password123',
    role: 'reader'
  }
];

for (const userData of users) {
  const existing = await User.findOne({ email: userData.email });
  if (!existing) {
    await User.create(userData);
    console.log(`${userData.role} seeded (${userData.email})`);
  } else {
    console.log(`${userData.role} already exists`);
  }
}

// Seed Books
const adminUser = await User.findOne({ role: 'admin' });
const authorUser = await User.findOne({ role: 'author' });

const dummyBooks = [
  {
    title: "The Silent Horizon",
    author: authorUser._id,
    category: "Science Fiction",
    documentType: "text",
    content: "The stars had gone dark, leaving only the hum of the station's life support...",
    coverUrl: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop",
    isFree: true,
    status: "approved",
    ratingAverage: 4.8,
    viewCount: 1240
  },
  {
    title: "Whispers of the Ancestors",
    author: authorUser._id,
    category: "Historical Fiction",
    documentType: "pdf",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    coverUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop",
    isFree: false,
    price: 12.99,
    status: "approved",
    ratingAverage: 4.5,
    viewCount: 850
  },
  {
    title: "Urban Architecture 2026",
    author: adminUser._id,
    category: "Non-Fiction",
    documentType: "pdf",
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    coverUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
    isFree: true,
    status: "approved",
    ratingAverage: 4.9,
    viewCount: 3200
  },
  {
    title: "Culinary Arts: Modern Methods",
    author: authorUser._id,
    category: "Cooking",
    documentType: "text",
    content: "The secret to a perfect emulsion lies not in the whisk, but in the temperature of the oil...",
    coverUrl: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2070&auto=format&fit=crop",
    isFree: false,
    price: 19.50,
    status: "approved",
    ratingAverage: 4.2,
    viewCount: 540
  },
  {
    title: "Digital Minimalism",
    author: adminUser._id,
    category: "Self-Help",
    documentType: "text",
    content: "To regain your focus, you must first starve the distractions of their lifeblood: your attention.",
    coverUrl: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2067&auto=format&fit=crop",
    isFree: true,
    status: "approved",
    ratingAverage: 4.7,
    viewCount: 2100
  }
];

for (const bookData of dummyBooks) {
  const existingBook = await Book.findOne({ title: bookData.title });
  if (!existingBook) {
    await Book.create(bookData);
    console.log(`Book seeded: ${bookData.title}`);
  }
}

process.exit();
