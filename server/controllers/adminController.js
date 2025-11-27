import { clerkClient } from '@clerk/express';
import Course from '../models/Course.js';
import EducatorRequest from '../models/EducatorRequest.js';

// Helper to check if user is admin
const checkAdmin = async (userId) => {
    try {
        const user = await clerkClient.users.getUser(userId);
        const email = user.emailAddresses?.[0]?.emailAddress;
        return email === process.env.ADMIN_EMAIL;
    } catch (error) {
        return false;
    }
}

// Get All Educator Requests
export const getEducatorRequests = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const isAdmin = await checkAdmin(userId);
        if(!isAdmin) return res.json({ success: false, message: "Unauthorized" });

        const requests = await EducatorRequest.find({ status: 'pending' });
        res.json({ success: true, requests });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Approve Educator Request
export const approveEducator = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const isAdmin = await checkAdmin(userId);
        if(!isAdmin) return res.json({ success: false, message: "Unauthorized" });

        const { requestId } = req.body;
        const request = await EducatorRequest.findById(requestId);

        if (!request) {
            return res.json({ success: false, message: "Request not found" });
        }

        // Update Clerk Metadata
        await clerkClient.users.updateUserMetadata(request.userId, {
            publicMetadata: { role: 'educator' },
        });

        request.status = 'approved';
        await request.save();

        res.json({ success: true, message: "Educator Approved" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Reject Educator Request
export const rejectEducator = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const isAdmin = await checkAdmin(userId);
        if(!isAdmin) return res.json({ success: false, message: "Unauthorized" });

        const { requestId } = req.body;
        const request = await EducatorRequest.findById(requestId);

        if (!request) {
            return res.json({ success: false, message: "Request not found" });
        }

        request.status = 'rejected';
        await request.save();

        res.json({ success: true, message: "Request Rejected" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get All Courses
export const getAllCourses = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const isAdmin = await checkAdmin(userId);
        if(!isAdmin) return res.json({ success: false, message: "Unauthorized" });

        const courses = await Course.find({}).populate('educator', 'name'); // Assuming educator field in Course is userId, might need adjustment if it's not a ref
        // Actually Course.educator is a String (clerk userId), so populate won't work directly unless we ref User.
        // Let's check Course model.
        // Course model: educator: { type: String, required: true } -> It's a string ID.
        // So we can't populate easily. We'll just send the courses.
        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Delete Course
export const deleteCourse = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const isAdmin = await checkAdmin(userId);
        if(!isAdmin) return res.json({ success: false, message: "Unauthorized" });

        const { courseId } = req.body;
        await Course.findByIdAndDelete(courseId);
        res.json({ success: true, message: "Course Deleted" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Get All Educators
export const getAllEducators = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const isAdmin = await checkAdmin(userId);
        if(!isAdmin) return res.json({ success: false, message: "Unauthorized" });

        // We need users who are educators. 
        // Since we don't have a 'role' field in our local User model (it's in Clerk), 
        // we might have to rely on Clerk or check our local User model if we sync roles.
        // But wait, the User model doesn't have role.
        // However, we can fetch all users and filter, or fetch from Clerk.
        // Fetching from Clerk is safer for roles.
        const users = await clerkClient.users.getUserList({ limit: 100 });
        const educators = users.data.filter(user => user.publicMetadata.role === 'educator');
        
        res.json({ success: true, educators });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

// Ban Educator (Revoke Role)
export const banEducator = async (req, res) => {
    try {
        const userId = req.auth.userId;
        const isAdmin = await checkAdmin(userId);
        if(!isAdmin) return res.json({ success: false, message: "Unauthorized" });

        const { userId: targetUserId } = req.body;
        await clerkClient.users.updateUserMetadata(targetUserId, {
            publicMetadata: { role: 'student' }, // Downgrade to student
        });
        res.json({ success: true, message: "Educator Banned (Role Revoked)" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}
