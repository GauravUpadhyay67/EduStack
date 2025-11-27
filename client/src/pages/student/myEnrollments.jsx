import axios from "axios";
import { Line } from "rc-progress";
import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets"; // Ensure assets are imported if needed for icons
import Footer from "../../components/student/Footer";
import { AppContext } from "../../context/AppContext";

const MyEnrollments = () => {
  const {
    enrolledCourses,
    calculateCourseDuration,
    navigate,
    userData,
    fetchUserEnrolledCourses,
    backendUrl,
    getToken,
    calculateNoOfLectures,
  } = useContext(AppContext);

  const [progressArray, setProgressArray] = useState([]);

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const tempProgressArray = await Promise.all(
        enrolledCourses.map(async (course) => {
          const { data } = await axios.post(
            `${backendUrl}/api/user/get-course-progress`,
            { courseId: course._id },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          let totalLectures = calculateNoOfLectures(course);
          const lectureCompleted = data.progressData
            ? data.progressData.lectureCompleted.length
            : 0;
          return { totalLectures, lectureCompleted };
        })
      );

      setProgressArray(tempProgressArray);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchUserEnrolledCourses();
    }
  }, [userData]);

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseProgress();
    }
  }, [enrolledCourses]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex-grow md:px-36 px-8 pt-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">My Enrollments</h1>
        
        {enrolledCourses.length === 0 ? (
           <div className="text-center py-20">
             <p className="text-gray-500 text-lg">You haven't enrolled in any courses yet.</p>
             <button onClick={() => navigate('/course-list')} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">Browse Courses</button>
           </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {enrolledCourses.map((course, index) => {
            const progress = progressArray[index]
              ? (progressArray[index].lectureCompleted * 100) /
                progressArray[index].totalLectures
              : 0;
            
            const isCompleted = progress === 100;

            return (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                onClick={() => navigate(`/player/${course._id}`)}
              >
                {/* Thumbnail */}
                <div className="relative w-full h-48 overflow-hidden">
                    <img
                    src={course.courseThumbnail}
                    alt={course.courseTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 min-h-[3.5rem]">
                    {course.courseTitle}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                          <img src={assets.time_clock_icon} alt="duration" className="w-3.5 h-3.5 opacity-70"/>
                          <span>{calculateCourseDuration(course)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                          <img src={assets.lesson_icon} alt="lectures" className="w-3.5 h-3.5 opacity-70"/>
                          <span>{progressArray[index] ? progressArray[index].totalLectures : 0} Lectures</span>
                      </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="font-medium text-gray-600">Progress</span>
                        <span className="font-medium text-blue-600">{Math.round(progress)}%</span>
                    </div>
                    <Line
                        percent={progress}
                        strokeWidth={2}
                        trailWidth={2}
                        strokeColor={isCompleted ? "#10B981" : "#2563EB"} // Green if completed, Blue otherwise
                        trailColor="#E5E7EB"
                        className="rounded-full"
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    className={`w-full py-2.5 rounded-md font-medium text-sm transition-colors ${
                        isCompleted 
                        ? "bg-green-100 text-green-700 hover:bg-green-200" 
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isCompleted ? "Completed" : "Continue Learning"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyEnrollments;
