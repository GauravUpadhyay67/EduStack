import dotenv from 'dotenv';
import connectDB from './configs/mongodb.js';
import Course from './models/Course.js';
import EducatorRequest from './models/EducatorRequest.js';
import User from './models/User.js';

dotenv.config();

const cleanupAdminData = async () => {
    try {
        await connectDB();
        
        const adminEmail = process.env.ADMIN_EMAIL;
        console.log(`Cleaning up data for admin email: ${adminEmail}`);

        // Find user by email
        const user = await User.findOne({ email: adminEmail });
        
        if (user) {
            console.log(`Found user: ${user.name} (${user._id})`);
            
            // Delete all courses created by this user
            const coursesDeleted = await Course.deleteMany({ educator: user._id });
            console.log(`Deleted ${coursesDeleted.deletedCount} courses`);
            
            // Delete the user
            await User.findByIdAndDelete(user._id);
            console.log(`Deleted user: ${user.name}`);
        } else {
            console.log('No user found with admin email in MongoDB');
        }
        
        // Delete any educator requests for this email
        const requestsDeleted = await EducatorRequest.deleteMany({ userEmail: adminEmail });
        console.log(`Deleted ${requestsDeleted.deletedCount} educator requests`);
        
        console.log('\n✅ Cleanup completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error during cleanup:', error);
        process.exit(1);
    }
};

cleanupAdminData();
