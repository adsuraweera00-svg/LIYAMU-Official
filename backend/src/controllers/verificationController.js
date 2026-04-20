import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { adminFirestore } from '../config/firebase.js';
import { notifyAdmins } from '../utils/notificationHelper.js';
import { ApiError } from '../utils/apiError.js';
import { v2 as cloudinary } from 'cloudinary';

const db = adminFirestore();

export const submitVerification = async (req, res) => {
  const { name, idNumber, contactNumber } = req.body;
  const existing = await db.collection('verificationRequests')
    .where('author', '==', req.user.id)
    .where('status', '==', 'pending')
    .get();
  
  if (!existing.empty) throw new ApiError(400, 'Pending request exists');
  
  const documentUrl = req.file 
    ? (req.file.path.startsWith('http') ? req.file.path : `/uploads/${req.file.filename}`)
    : req.body.documentUrl;
  
  if (!documentUrl) throw new ApiError(400, 'Document required');

  const requestData = {
    author: req.user.id,
    name,
    idNumber,
    contactNumber,
    documentUrl,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  const docRef = await db.collection('verificationRequests').add(requestData);

  await db.collection('notifications').add({
    user: req.user.id,
    title: 'Verification submitted',
    message: 'Submitted. Wait up to 4 days.',
    type: 'verification',
    createdAt: new Date().toISOString(),
    read: false
  });

  await notifyAdmins({
    title: 'Identity Verification Pending',
    message: `New request from ${name}.`,
    type: 'verification',
    metadata: { action_type: 'kyc_submission', name, idNumber }
  });

  res.status(201).json({ id: docRef.id, ...requestData });
};

export const getVerificationRequests = async (req, res) => {
  const snapshot = await db.collection('verificationRequests').get();
  const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const userIds = [...new Set(requests.map(r => r.author))];
  const users = {};
  if (userIds.length > 0) {
    const userSnap = await db.collection('users').where('__name__', 'in', userIds).get();
    userSnap.forEach(d => users[d.id] = d.data());
  }

  res.json(requests.map(r => ({ ...r, author: { id: r.author, name: users[r.author]?.name, email: users[r.author]?.email } })));
};

export const decideVerification = async (req, res) => {
  const { status, rejectionReason } = req.body;
  const ref = db.collection('verificationRequests').doc(req.params.id);
  const doc = await ref.get();
  if (!doc.exists) throw new ApiError(404, 'Request not found');

  await ref.update({ 
    status, 
    rejectionReason: rejectionReason || null, 
    reviewedAt: new Date().toISOString(),
    reviewedBy: req.user.id
  });

  if (status === 'accepted') {
    const authorRef = db.collection('users').doc(doc.data().author);
    await authorRef.update({
      role: 'verified_author',
      'badges.verifiedAuthor': true
    });

    const authorDoc = await authorRef.get();
    const authorData = authorDoc.data();

    // PDF logic (minimal changes to path/fs)
    const outputDir = path.resolve('uploads');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const pdfPath = path.join(outputDir, `verification-${authorDoc.id}.pdf`);
    const docPdf = new PDFDocument();
    
    const stream = fs.createWriteStream(pdfPath);
    docPdf.pipe(stream);
    docPdf.fontSize(18).text('Verified Author Certificate');
    docPdf.moveDown();
    docPdf.fontSize(12).text(`User name: ${authorData.name}`);
    docPdf.text(`Email: ${authorData.email}`);
    docPdf.text(`Contact: ${doc.data().contactNumber}`);
    docPdf.text(`Date: ${new Date().toLocaleDateString()}`);
    docPdf.end();

    stream.on('finish', async () => {
      try {
        if (process.env.CLOUDINARY_CLOUD_NAME) {
          const result = await cloudinary.uploader.upload(pdfPath, {
            folder: 'liyamu/certificates',
            resource_type: 'auto'
          });
          await ref.update({ certificateUrl: result.secure_url });
        }
        if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
      } catch (err) { console.error('PDF Upload Error:', err); }
    });
  }

  await db.collection('notifications').add({
    user: doc.data().author,
    title: `Verification ${status}`,
    message: status === 'accepted' ? 'Approved!' : `Rejected: ${rejectionReason}`,
    type: 'verification',
    createdAt: new Date().toISOString(),
    read: false
  });

  const updatedDoc = await ref.get();
  res.json({ id: updatedDoc.id, ...updatedDoc.data() });
};
