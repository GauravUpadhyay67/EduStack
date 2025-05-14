import express from 'express';
import cors from 'cors';
import connectDB from './configs/mongodb.js';
import dotenv from 'dotenv';
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js';
import educatorRouter from './routes/educatorRoutes.js';
import { clerkMiddleware } from '@clerk/express';
import connectCloudinary from './configs/cloudinary.js';
import courseRouter from './routes/courseRoute.js';
import userRouter from './routes/userRoutes.js';

dotenv.config()

const app = express();
const port = process.env.PORT || 5000;


// Middlewares
app.use(cors());
app.use(clerkMiddleware())

// Connect to MongoDB
await connectDB()
await connectCloudinary()

// Route
app.get('/', (req, res) => res.send('Hello India!'));
app.post('/clerk', express.json(), clerkWebhooks);
app.use('/api/educator', express.json(), educatorRouter);
app.use('/api/course', express.json(), courseRouter);
app.use('/api/user', express.json(), userRouter);
app.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);


// Port
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
