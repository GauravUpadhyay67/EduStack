import express from 'express';
import {
    approveEducator,
    banEducator,
    deleteCourse,
    getAllCourses,
    getAllEducators,
    getEducatorRequests,
    rejectEducator
} from '../controllers/adminController.js';

const adminRouter = express.Router();

adminRouter.get('/educator-requests', getEducatorRequests);
adminRouter.post('/approve-educator', approveEducator);
adminRouter.post('/reject-educator', rejectEducator);
adminRouter.get('/courses', getAllCourses);
adminRouter.post('/delete-course', deleteCourse);
adminRouter.get('/educators', getAllEducators);
adminRouter.post('/ban-educator', banEducator);

export default adminRouter;
