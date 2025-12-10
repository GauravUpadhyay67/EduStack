import express from 'express';
import { getAllCourse, getCourseId, getVideoDuration } from '../controllers/courseController.js';


const courseRouter = express.Router();

courseRouter.get('/all', getAllCourse)
courseRouter.get('/:id', getCourseId)

courseRouter.post('/:id/video-duration', getVideoDuration)

export default courseRouter;