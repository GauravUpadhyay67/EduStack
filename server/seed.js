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

    // 2. Create Dummy Courses
    const courses = [
      {
        courseTitle: "Complete React Guide",
        courseDescription: "<p>Master React.js from scratch. Learn Hooks, Redux, and more.</p>",
        courseThumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png",
        coursePrice: 49.99,
        isPublished: true,
        discount: 20,
        educator: educatorId,
        courseContent: [
          {
            chapterId: "ch_1",
            chapterOrder: 1,
            chapterTitle: "Introduction",
            chapterContent: [
              {
                lectureId: "lec_1",
                lectureTitle: "What is React?",
                lectureDuration: 10,
                lectureUrl: "https://www.youtube.com/watch?v=SqcY0GlETPk",
                isPreviewFree: true,
                lectureOrder: 1
              },
              {
                lectureId: "lec_2",
                lectureTitle: "Setup Environment",
                lectureDuration: 15,
                lectureUrl: "https://www.youtube.com/watch?v=dGcsHMXbSOA",
                isPreviewFree: false,
                lectureOrder: 2
              }
            ]
          }
        ]
      },
      {
        courseTitle: "Node.js for Beginners",
        courseDescription: "<p>Build scalable backend applications with Node.js and Express.</p>",
        courseThumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/1200px-Node.js_logo.svg.png",
        coursePrice: 39.99,
        isPublished: true,
        discount: 10,
        educator: educatorId,
        courseContent: [
            {
              chapterId: "ch_1",
              chapterOrder: 1,
              chapterTitle: "Getting Started",
              chapterContent: [
                {
                  lectureId: "lec_1",
                  lectureTitle: "Intro to Node",
                  lectureDuration: 12,
                  lectureUrl: "https://www.youtube.com/watch?v=TlB_eWDSMt4",
                  isPreviewFree: true,
                  lectureOrder: 1
                }
              ]
            }
          ]
      },
      {
        courseTitle: "MongoDB Mastery",
        courseDescription: "<p>Learn NoSQL database design and management with MongoDB.</p>",
        courseThumbnail: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/MongoDB_Logo.svg/2560px-MongoDB_Logo.svg.png",
        coursePrice: 29.99,
        isPublished: true,
        discount: 50,
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
