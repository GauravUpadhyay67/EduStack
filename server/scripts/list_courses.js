import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import Course from '../models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    const courses = await Course.find({});
    console.log("Listing all courses:");
    courses.forEach(c => console.log(`ID: ${c._id}, Title: "${c.courseTitle}"`));
    process.exit();
};

run();
