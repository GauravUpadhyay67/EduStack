import axios from 'axios'
import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import CallToAction from '../../components/student/CallToAction'
import Companies from '../../components/student/Companies'
import CoursesSection from '../../components/student/CoursesSection'
import Footer from '../../components/student/Footer'
import Hero from '../../components/student/Hero'
import TestimonialsSection from '../../components/student/TestimonialsSection'
import { AppContext } from '../../context/AppContext'

const Home = () => {

  const { user, enrolledCourses, calculateNoOfLectures, backendUrl, getToken, calculateChapterTime, navigate } = useContext(AppContext);
  const [resumeCourse, setResumeCourse] = useState(null);
  const [progress, setProgress] = useState(0);

  const fetchResumeData = async () => {
    if (enrolledCourses && enrolledCourses.length > 0) {
      const course = enrolledCourses[0]; // Most recent
      try {
        const token = await getToken();
        const { data } = await axios.post(backendUrl + '/api/user/get-course-progress', 
          { courseId: course._id },
          { headers: { Authorization: `Bearer ${token}` }}
        );

        if (data.success) {
          if (data.progressData) {
            const totalLectures = calculateNoOfLectures(course);
            const completedLectures = data.progressData.lectureCompleted.length;
            const progressPercent = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
            setProgress(progressPercent);
          } else {
             setProgress(0);
          }
           setResumeCourse(course);
        }
      } catch (error) {
        console.error("Failed to fetch progress", error);
      }
    }
  };

  useEffect(() => {
    if (user && enrolledCourses.length > 0) {
      fetchResumeData();
    }
  }, [user, enrolledCourses]);

  return (
    <div className='flex flex-col items-center space-y-7 text-center'>
      
      {resumeCourse && (
        <div className='w-full max-w-4xl mx-auto mt-8 px-4 md:px-0'>
          <div className='bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden'>
             <div className='absolute top-0 right-0 opacity-10 transform translate-x-10 -translate-y-10'>
                <img src={assets.course_1_thumbnail} alt="" className='w-64 h-64 object-cover rounded-full' />
             </div>
             
             <div className='text-left z-10'>
                <p className='text-sm font-medium text-blue-100 mb-1'>Welcome back, {user.fullName || 'Learner'}! 👋</p>
                <h2 className='text-2xl font-bold mb-2'>{progress > 0 ? 'Ready to continue?' : 'Ready to start learning?'}</h2>
                <div className='flex items-center gap-3'>
                  <p className='text-lg font-semibold'>{resumeCourse.courseTitle}</p>
                  <span className='px-2 py-0.5 bg-blue-500/30 rounded text-xs border border-blue-400/50'>{progress > 0 ? 'In Progress' : 'Not Started'}</span>
                </div>
                
                <div className='mt-4 flex flex-col gap-1'>
                   <div className='flex justify-between text-xs text-blue-100'>
                      <span>Progress</span>
                      <span>{progress}%</span>
                   </div>
                   <div className='w-full max-w-xs bg-blue-800/50 rounded-full h-2'>
                      <div className='bg-white h-2 rounded-full transition-all duration-500' style={{ width: `${progress}%` }}></div>
                   </div>
                </div>
             </div>

             <div className='mt-6 md:mt-0 z-10'>
                <Link to={`/player/${resumeCourse._id}`} onClick={() => scrollTo(0,0)} className='bg-white text-blue-600 px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2'>
                   <img src={assets.play_icon} alt="" className="w-4 h-4" /> {progress > 0 ? 'Continue Learning' : 'Start Learning'}
                </Link>
             </div>
          </div>
        </div>
      )}

      <Hero/>
      <Companies/>
      <CoursesSection/>
      <TestimonialsSection/>
      <CallToAction/>
      <Footer/>
    </div>
  )
}

export default Home