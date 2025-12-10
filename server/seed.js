import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Course from './models/Course.js';
import User from './models/User.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/EduStack`);
    console.log("✅ MongoDB Connected");

    // 1. Create Dummy Educator
    const educatorId = "educator_123";
    let educator = await User.findById(educatorId);

    if (!educator) {
      educator = await User.create({
        _id: educatorId,
        name: "John Doe (Educator)",
        email: "educator@example.com",
        imageUrl: "https://ui-avatars.com/api/?name=John+Doe&background=random",
        enrolledCourses: []
      });
      console.log("✅ Dummy Educator Created");
    } else {
      console.log("ℹ️ Dummy Educator already exists");
    }

    // 2. Create Professional Dummy Courses
    const courses = [
      {
        courseTitle: "Advanced React Patterns",
        courseDescription: "<p>Deep dive into React.js. Master Hooks, Context API, Performance Optimization, and scalable architecture for large applications.</p>",
        courseThumbnail: "/course_images/react.png",
        coursePrice: 89.99,
        isPublished: true,
        discount: 15,
        educator: educatorId,
        courseContent: [
          {
            chapterId: "ch_1",
            chapterOrder: 1,
            chapterTitle: "Advanced Hooks",
            chapterContent: [
              {
                lectureId: "lec_1",
                lectureTitle: "useMemo and useCallback",
                lectureDuration: 15,
                lectureUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk",
                isPreviewFree: true,
                lectureOrder: 1
              }
            ]
          }
        ]
      },
      {
        courseTitle: "Scalable Node.js Backend Architecture",
        courseDescription: "<p>Build production-ready microservices, handle high concurrency, and secure your APIs with Node.js, Express, and MongoDB.</p>",
        courseThumbnail: "/course_images/node.png",
        coursePrice: 79.99,
        isPublished: true,
        discount: 10,
        educator: educatorId,
        courseContent: []
      },
      {
        courseTitle: "AI & Deep Learning for Beginners",
        courseDescription: "<p>Start your journey into Artificial Intelligence. Understand Neural Networks, TensorFlow, and build your first ML model.</p>",
        courseThumbnail: "/course_images/ai.png",
        coursePrice: 99.99,
        isPublished: true,
        discount: 25,
        educator: educatorId,
        courseContent: []
      },
      {
        courseTitle: "Modern UI/UX Design Masterclass",
        courseDescription: "<p>Learn to design stunning user interfaces and intuitive user experiences. Covers Figma, prototyping, and design systems.</p>",
        courseThumbnail: "/course_images/uiux.png",
        coursePrice: 69.99,
        isPublished: true,
        discount: 20,
        educator: educatorId,
        courseContent: []
      }
    ];

    await Course.deleteMany({ educator: educatorId }); // Clear old dummy courses
    await Course.insertMany(courses);
    console.log("✅ Dummy Courses Seeded");

    process.exit();
  } catch (error) {
    console.error("❌ Seeding Failed:", error);
    process.exit(1);
  }
};

seedDatabase();
