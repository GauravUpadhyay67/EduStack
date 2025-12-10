import { clerkClient } from '@clerk/express';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import Course from '../models/Course.js';
import { Purchase } from '../models/Purchase.js';
import User from '../models/User.js';

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

import EducatorRequest from '../models/EducatorRequest.js';

export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth.userId;

    const user = await clerkClient.users.getUser(userId);
    const email = user.emailAddresses?.[0]?.emailAddress || 'N/A';
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();

    // Check if request already exists
    const existingRequest = await EducatorRequest.findOne({ userId });
    if (existingRequest) {
        if (existingRequest.status === 'pending') {
            return res.json({ success: false, message: 'Request already pending.' });
        }
        if (existingRequest.status === 'approved') {
            // Check if user is actually an educator in Clerk
            if (user.publicMetadata?.role === 'educator') {
                return res.json({ success: false, message: 'You are already an educator.' });
            } else {
                // User has approved request but no role (likely banned/revoked)
                // Reset request to pending to allow re-application
                existingRequest.status = 'pending';
                existingRequest.createdAt = new Date(); // Update timestamp
                await existingRequest.save();
                return res.json({ success: true, message: 'Request sent to admin for approval.' });
            }
        }
    }

    await EducatorRequest.create({
        userId,
        userName: name,
        userEmail: email,
        status: 'pending'
    });

    res.json({ success: true, message: 'Request sent to admin for approval.' });
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
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image', transformation: [{ width: 1280, height: 720, crop: "fill" }] });
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

export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const educator = req.auth.userId;
    
    const course = await Course.findOne({ _id: id, educator });
    
    if (!course) {
      return res.json({ success: false, message: 'Course not found or unauthorized' });
    }
    
    res.json({ success: true, course });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { courseData } = req.body;
    const imageFile = req.file;
    const educatorId = req.auth.userId;

    const course = await Course.findOne({ _id: id, educator: educatorId });
    
    if (!course) {
      return res.json({ success: false, message: 'Course not found or unauthorized' });
    }

    const parsedCourseData = JSON.parse(courseData);
    
    // Update course fields
    course.courseTitle = parsedCourseData.courseTitle;
    course.courseDescription = parsedCourseData.courseDescription;
    course.coursePrice = parsedCourseData.coursePrice;
    course.discount = parsedCourseData.discount;
    course.courseContent = parsedCourseData.courseContent;
    course.isPublished = parsedCourseData.isPublished;
    
    // Update thumbnail if new image provided
    if (imageFile) {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: 'image', transformation: [{ width: 1280, height: 720, crop: "fill" }] });
      course.courseThumbnail = imageUpload.secure_url;
    }
    
    await course.save();

    res.json({ success: true, message: 'Course Updated Successfully' });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
