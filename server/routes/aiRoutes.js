import express from 'express';
import { generateCourseDescription, generateCourseOutline } from '../controllers/aiController.js';

const aiRouter = express.Router();

aiRouter.post('/generate-outline', generateCourseOutline);
aiRouter.post('/generate-description', generateCourseDescription);

export default aiRouter;
