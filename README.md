# LIYAMU - Digital Library & Publication Platform

**LIYAMU** is a premium, full-stack digital publishing ecosystem designed for authors to showcase their work and readers to discover high-quality content. Built with a focus on modern aesthetics (glassmorphism/dark mode) and robust administrative control.

## 🚀 Technology Stack

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + Framer Motion for smooth animations
- **Icons**: Lucide React
- **Rich Text**: React Quill
- **PDF Rendering**: React PDF

### Backend
- **Runtime**: Node.js + Express
- **Database**: MongoDB via Mongoose
- **Security**: JWT Authentication, Helmet, HPP, Express Rate Limit
- **File Handling**: Multer (Local/Cloudinary support)

## ✨ Key Features

### For Authors
- **Creative Corner**: Submit and manage creative works.
- **Book Publishing**: Upload books (PDF or Rich Text) for approval.
- **Earnings Tracking**: Real-time balance and withdrawal management.
- **Verification System**: Verified badge for established writers.

### For Readers
- **Discover**: Browse by categories (Sci-Fi, Fiction, Architecture, etc.).
- **Reading Experience**: High-quality PDF viewer and rich text reader.
- **Social**: Follow favorite authors and manage reading history.
- **Credits**: Secure credit system for purchasing premium content.

### For Administrators
- **Access Control**: Global role management (Reader, Author, Pro Writer, Admin).
- **Security Safeguards**: 
  - **Owner Protection**: Explicit protection for the `liyamu.owner@gmail.com` account (Immutable role, ban protection, and deletion block).
  - **Secure Deletion**: Triple-confirmation wipe with admin password requirement.
- **Moderation**: Approve/Reject book submissions and creative works.

## 🛠️ Local & Production Setup

### 1. Backend Configuration
1. Navigate to `/backend`
2. Run `npm install`
3. Create a `.env` file based on `.env.example`:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A long random string for security.
   - **Production Storage**: To ensure file persistence on hosting services like Render, adding Cloudinary keys is **required**:
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
4. Run `npm run seed` to initialize categories.
5. Run `npm run dev`.

### 2. Frontend Configuration
1. Navigate to `/frontend`
2. Run `npm install`
3. Create a `.env` file based on `.env.example`:
   - `VITE_API_URL`: `http://localhost:5000` (Local) or your production API URL.
4. Run `npm run dev`.

## 🌐 Production Deployment Guide

| Component | Recommended Service | Note |
| :--- | :--- | :--- |
| **Database** | MongoDB Atlas | Use the Free Shared Tier. |
| **Backend** | Render.com | Free Web Service (Auto-switches to Cloudinary if keys are present). |
| **Frontend** | Vercel / Netlify | Connect the `/frontend` directory separately. |
| **Files** | Cloudinary | Essential for saving PDFs and images in production. |

## 🔒 Security Notes
- **JWT Protection**: All sensitive API routes are protected by role-based authorization.
- **Data Integrity**: Soft-delete implemented for user accounts to maintain audit trails.
- **Owner Account**: The primary owner account is hard-locked at both UI and API levels to prevent accidental lockout or deletion.
- **Privacy**: User documents (NIC/ID) are stored in secure cloud folders.

---
*Official LIYAMU Platform - Built for the next generation of digital authors.*


