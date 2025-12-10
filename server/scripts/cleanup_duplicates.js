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
        await mongoose.connect(`${process.env.MONGODB_URI}/EduStack`);
        console.log('MongoDB Connected');
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const run = async () => {
    await connectDB();
    const title = "Complete Full Stack Web Development Bootcamp";
    // Find courses with this title, sorted by creation time (most recent first)
    // createdAt -1 means descending order
    const courses = await Course.find({ courseTitle: title }).sort({ _id: -1 });
    
    console.log(`Found ${courses.length} copies of "${title}".`);

    if (courses.length > 1) {
        console.log(`Deleting the most recent one (ID: ${courses[0]._id}) to keep the older one...`);
        // We assume the first one created (last in the array if sorted by date desc? No, last in array is oldest)
        // Actually, user clicked "Add", waited, clicked "Add" again.
        // So the first request created one, the second request created another LATER.
        // Usually we want to keep the one that was created FIRST (or has content?).
        // Since they are duplicates of "same content", it doesn't matter much.
        // But deleting the *latest* one is safer if the first one is already being used or viewed.
        
        await Course.findByIdAndDelete(courses[0]._id);
        console.log(`Successfully deleted duplicate course.`);
    } else {
        console.log("No duplicates found to delete.");
    }
    process.exit();
};

run();
