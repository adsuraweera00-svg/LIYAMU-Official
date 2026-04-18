import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import VerificationRequest from '../models/VerificationRequest.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { notifyAdmins } from '../utils/notificationHelper.js';
import { ApiError } from '../utils/apiError.js';

export const submitVerification = async (req, res) => {
  const { name, idNumber, contactNumber } = req.body;
  const existing = await VerificationRequest.findOne({ author: req.user._id, status: 'pending' });
  if (existing) throw new ApiError(400, 'Pending request already exists');
  
  // Handle file upload for verification document
  const documentUrl = req.file ? `/uploads/${req.file.filename}` : req.body.documentUrl;
  
  if (!documentUrl) throw new ApiError(400, 'Verification document is required');

  const request = await VerificationRequest.create({
    author: req.user._id,
    name,
    idNumber,
    contactNumber,
    documentUrl,
  });

  await Notification.create({
    user: req.user._id,
    title: 'Verification submitted',
    message: 'Your application has been submitted. Wait for verification. Verification may take up to 4 days.',
    type: 'verification',
  });

  // Notify Admins
  await notifyAdmins({
    title: 'Identity Verification Pending',
    message: `New verification request from ${name}.`,
    type: 'verification',
    metadata: {
      action_type: 'kyc_submission',
      name,
      idNumber
    }
  });

  res.status(201).json(request);
};

export const getVerificationRequests = async (req, res) => {
  const requests = await VerificationRequest.find().populate('author', 'name email');
  res.json(requests);
};

export const decideVerification = async (req, res) => {
  const { status, rejectionReason } = req.body;
  const request = await VerificationRequest.findById(req.params.id).populate('author');
  if (!request) throw new ApiError(404, 'Request not found');
  request.status = status;
  if (rejectionReason) request.rejectionReason = rejectionReason;
  request.reviewedAt = new Date();
  request.reviewedBy = req.user._id;
  await request.save();

  if (status === 'accepted') {
    const author = await User.findById(request.author._id);
    author.role = 'verified_author'; // Correct role assignment
    author.badges.verifiedAuthor = true;
    await author.save();

    // Notify ALL admins about the approval (optional but requested "notify the admin and the user")
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        title: 'Author Approved',
        message: `Admin ${req.user.name} approved ${author.name} as a verified author.`,
        type: 'verification'
      });
    }

    // PDF Certificate Generation (existing logic)
    const outputDir = path.resolve('uploads');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    const pdfPath = path.join(outputDir, `verification-${author._id}.pdf`);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));
    doc.fontSize(18).text('Verified Author Certificate');
    doc.moveDown();
    doc.fontSize(12).text(`User name: ${author.name}`);
    doc.text(`Email: ${author.email}`);
    doc.text(`Contact number: ${request.contactNumber}`);
    doc.text(`Verified date: ${new Date().toLocaleDateString()}`);
    doc.text(`Approved by: ${req.user.name}`);
    doc.end();
  }

  await Notification.create({
    user: request.author._id,
    title: `Verification ${status === 'accepted' ? 'Approved' : 'Rejected'}`,
    message: status === 'accepted' 
      ? 'Congratulations! Your author verification was approved. You can now publish books.' 
      : `Your author verification was rejected. Reason: ${rejectionReason || 'No reason provided.'}`,
    type: 'verification',
  });

  res.json(request);
};
