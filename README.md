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

## 🛠️ Local Setup

### 1. Backend Configuration
```bash
cd backend
npm install
cp .env.example .env
npm run seed   # Seed initial categories and demo data
npm run dev    # Start dev server on http://localhost:5000
```

### 2. Frontend Configuration
```bash
cd frontend
npm install
cp .env.example .env
npm run dev    # Start vite dev server on http://localhost:5173
```

## 🔒 Security Notes
- **JWT Protection**: All sensitive API routes are protected by role-based authorization.
- **Data Integrity**: Soft-delete implemented for user accounts to maintain audit trails.
- **Owner Account**: The primary owner account is hard-locked at both UI and API levels to prevent accidental lockout or deletion.

---
*Created with focus on speed, security, and premium user experience.*

