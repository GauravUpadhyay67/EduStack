import express from 'express';
import upload from '../configs/multer.js';
import { addCourse, educatorDashboardData, getCourseById, getEducatorCourses, getEnrolledStudentsData, updateCourse, updateRoleToEducator, verifyEducatorOTP } from '../controllers/educatorController.js';
import { protectEducator } from '../middlewares/authMiddleware.js';

const educatorRouter = express.Router();

// Add Educator Role
educatorRouter.get('/update-role', updateRoleToEducator);
educatorRouter.post('/verify-otp', verifyEducatorOTP)
educatorRouter.post('/add-course', upload.single('image'), protectEducator, addCourse)
educatorRouter.get('/courses', protectEducator, getEducatorCourses);
educatorRouter.get('/course/:id', protectEducator, getCourseById);
educatorRouter.put('/update-course/:id', upload.single('image'), protectEducator, updateCourse);
educatorRouter.get('/dashboard', protectEducator, educatorDashboardData);
educatorRouter.get('/enrolled-students', protectEducator, getEnrolledStudentsData);


export default educatorRouter;



