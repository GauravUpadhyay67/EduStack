import { clerkClient } from '@clerk/express';
import Course from '../models/Course.js';
import { v2 as cloudinary } from 'cloudinary';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// TEMP: Store OTPs in memory (You can use DB or Redis in prod)
const educatorOTPs = {}; // { userId: { otp: '123456', expiresAt: Date } }

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASS,
  },
});

export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // OTP valid for 5 mins

    educatorOTPs[userId] = { otp, expiresAt };

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role: 'pending-educator' },
    });

    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress || 'N/A';
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();

    const mailOptions = {
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL, // Send OTP to admin
      subject: 'New Educator Approval Request',
      html: `
        <h2>New Educator Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>User ID:</strong> ${userId}</p>
        <p><strong>OTP for approval:</strong> <b style="font-size: 20px">${otp}</b></p>
        <p>This OTP will expire in <b>5 minutes</b>.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'OTP sent to admin for approval.' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const verifyEducatorOTP = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { otp } = req.body;

    const stored = educatorOTPs[userId];

    if (!stored) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request again.",
      });
    }

    if (Date.now() > stored.expiresAt) {
      delete educatorOTPs[userId];
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please request again.",
      });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // ✅ OTP is correct — update role
    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: { role: "educator" },
    });

    delete educatorOTPs[userId];

    res.json({
      success: true,
      message: "You are now approved as an educator.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};


export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth.userId;

    if (!imageFile) {
      return res.json({ success: false, message: 'Thumbnail Not Attached' });
    }

    const parsedCourseData = await JSON.parse(courseData);
    parsedCourseData.educator = educatorId;
    const newCourse = await Course.create(parsedCourseData);
    const imageUpload = await cloudinary.uploader.upload(imageFile.path);
    newCourse.courseThumbnail = imageUpload.secure_url;
    await newCourse.save();

    res.json({ success: true, message: 'Course Added' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getEducatorCourses = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    res.json({ success: true, courses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const educatorDashboardData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const totalCourses = courses.length;

    const courseIds = courses.map(course => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: 'completed',
    });

    const totalEarnings = purchases.reduce((sum, p) => sum + p.amount, 0);

    const enrolledStudentsData = [];
    for (const course of courses) {
      const students = await User.find({ _id: { $in: course.enrolledStudents } }, 'name imageUrl');
      students.forEach(student => {
        enrolledStudentsData.push({ courseTitle: course.courseTitle, student });
      });
    }

    res.json({
      success: true,
      dashboardData: { totalEarnings, enrolledStudentsData, totalCourses },
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getEnrolledStudentsData = async (req, res) => {
  try {
    const educator = req.auth.userId;
    const courses = await Course.find({ educator });
    const courseIds = courses.map(course => course._id);

    const purchases = await Purchase.find({
      courseId: { $in: courseIds },
      status: 'completed',
    })
      .populate('userId', 'name imageUrl')
      .populate('courseId', 'courseTitle');

    const enrolledStudents = purchases.map(purchase => ({
      student: purchase.userId,
      courseTitle: purchase.courseId.courseTitle,
      purchaseData: purchase.createdAt,
    }));

    res.json({ success: true, enrolledStudents });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
