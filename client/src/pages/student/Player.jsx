import axios from "axios";
import humanizeDuration from "humanize-duration";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import YouTube from "react-youtube";
import { assets } from "../../assets/assets";
import Footer from "../../components/student/Footer";
import Loading from '../../components/student/Loading';
import Rating from "../../components/student/Rating";
import { AppContext } from "../../context/AppContext";

const Player = () => {
  const { enrolledCourses, calculateChapterTime, backendUrl, getToken, userData, fetchUserEnrolledCourses, calculateNoOfLectures } = useContext(AppContext);
  const { courseId } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [progressData, setProgressData] = useState(null)
  const [initialRating, setInitialRating] = useState(0)
  const [openCertificate, setOpenCertificate] = useState(false);

  // ✅ YouTube Video ID Extractor
  const extractYouTubeVideoId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const getCourseData = () => {
    enrolledCourses.forEach((course) => {
      if (course._id === courseId) {
        setCourseData(course);
        course.courseRatings.map(item => {
          if(item.userId === userData._id){
            setInitialRating(item.rating)
          }
        })
      }
    });
  };

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    if(enrolledCourses.length > 0){
      getCourseData();
    }
  }, [enrolledCourses]);

  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(backendUrl + '/api/user/update-course-progress', { courseId, lectureId }, { headers: { Authorization: `Bearer ${token}` }})

      if(data.success){
        toast.success(data.message)
        getCourseProgress()
      } else {
        toast.error(data.message)
      }
      
    } catch (error) {
      toast.error(error.message)
    }
  }

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(backendUrl + '/api/user/get-course-progress', { courseId }, { headers: { Authorization: `Bearer ${token}` }})

      if(data.success){
        setProgressData(data.progressData)
      } else {
        toast.error(data.message)
      }
      
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleRate = async (rating) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(backendUrl + '/api/user/add-rating', { courseId, rating }, { headers: { Authorization: `Bearer ${token}` }})

      if(data.success){
        toast.success(data.message)
        fetchUserEnrolledCourses()
      } else {
        toast.error(data.message)
      }
      
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    getCourseProgress()
  }, [])


  return courseData ? (
    <>
      <div className="p-4 sm:p-10 flex flex-col-reverse md:grid md:grid-cols-2 gap-10 md:px-36 min-h-screen">
        {/* Left Column: Course Structure */}
        <div className="text-gray-800">
          <h2 className="text-2xl font-bold mb-6">Course Content</h2>

          <div className="space-y-4">
            {courseData &&
              courseData.courseContent.map((chapter, chapterIndex) => (
                <div
                  key={chapterIndex}
                  className="border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer select-none bg-gray-50 hover:bg-gray-100 transition-colors"
                    onClick={() => toggleSection(chapterIndex)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        className={`transform transition-transform duration-300 w-4 h-4 ${
                          openSections[chapterIndex] ? "rotate-180" : ""
                        }`}
                        src={assets.down_arrow_icon}
                        alt="arrow icon"
                      />
                      <p className="font-semibold text-gray-700">
                        {chapter.chapterTitle}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">
                      {chapter.chapterContent.length} lectures • {calculateChapterTime(chapter)}
                    </p>
                  </div>

                  <div
                    className={`transition-all duration-300 ease-in-out ${
                      openSections[chapterIndex] ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <ul className="divide-y divide-gray-100">
                      {chapter.chapterContent.map((lecture, lectureIndex) => {
                         const isCompleted = progressData && progressData.lectureCompleted.includes(lecture.lectureId);
                         const isActive = playerData && playerData.lectureId === lecture.lectureId;

                         return (
                        <li 
                            key={lectureIndex} 
                            className={`flex items-center justify-between px-5 py-3 hover:bg-blue-50 transition-colors cursor-pointer ${isActive ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                            onClick={() => {
                                if(lecture.lectureUrl) {
                                    setPlayerData({
                                        ...lecture,
                                        chapter: chapterIndex + 1,
                                        lecture: lectureIndex + 1,
                                      })
                                }
                            }}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={isCompleted ? assets.blue_tick_icon : assets.play_icon}
                              alt="status icon"
                              className="w-5 h-5"
                            />
                            <div>
                                <p className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>{lecture.lectureTitle}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {humanizeDuration(
                                        lecture.lectureDuration * 60 * 1000,
                                        { units: ["h", "m"] }
                                    )}
                                </p>
                            </div>
                          </div>
                          
                          {lecture.lectureUrl && (
                             <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                 Watch
                             </span>
                          )}
                        </li>
                      )})}
                    </ul>
                  </div>
                </div>
              ))}
          </div>


          <div className="flex items-center gap-3 py-6 mt-8 border-t border-gray-200">
           <h1 className="text-lg font-bold text-gray-800">Rate this Course:</h1>
           <Rating initialRating={initialRating} onRate={handleRate}/>
          </div>

          {/* Certificate Section */}
          {courseData && progressData && calculateNoOfLectures(courseData) === progressData.lectureCompleted.length && (
             <div className="mt-8 mb-8 bg-green-50 border border-green-200 rounded-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                   <div className="bg-green-100 p-3 rounded-full">
                      <img src={assets.blue_tick_icon} alt="" className="w-8 h-8"/> 
                   </div>
                   <div>
                      <h3 className="text-lg font-bold text-green-800">Course Completed!</h3>
                      <p className="text-green-600 text-sm">You have completed all lectures. Claim your certificate now.</p>
                   </div>
                </div>
                <button onClick={() => setOpenCertificate(true)} className="bg-green-600 text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-green-700 transition-all flex items-center gap-2">
                   Download Certificate 🎓
                </button>
             </div>
          )}

        </div>

        {/* Right Column: Video Player */}
        <div className="md:mt-0">
          <div className="sticky top-24">
            {playerData ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="w-full aspect-video bg-black">
                    <YouTube
                        videoId={extractYouTubeVideoId(playerData.lectureUrl)}
                        iframeClassName="w-full h-full"
                        className="w-full h-full" 
                        opts={{
                            playerVars: {
                                autoplay: 1,
                            }
                        }}
                    />
                </div>
                <div className="p-6">
                    <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                            <p className="text-sm text-blue-600 font-medium mb-1">
                                Chapter {playerData.chapter} • Lecture {playerData.lecture}
                            </p>
                            <h2 className="text-xl font-bold text-gray-900 leading-tight">
                                {playerData.lectureTitle}
                            </h2>
                        </div>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                markLectureAsCompleted(playerData.lectureId);
                            }} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                                progressData && progressData.lectureCompleted.includes(playerData.lectureId) 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                            }`}
                        >
                            {progressData && progressData.lectureCompleted.includes(playerData.lectureId) ? (
                                <>
                                    <img src={assets.blue_tick_icon} className="w-4 h-4" alt="check"/>
                                    Completed
                                </>
                            ) : 'Mark Completed'}
                        </button>
                    </div>
                </div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <img
                    src={courseData ? courseData.courseThumbnail : ""}
                    alt="Course thumbnail"
                    className="w-full aspect-video object-cover"
                    />
                    <div className="p-6 text-center">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Start Learning</h2>
                        <p className="text-gray-600">Select a lecture from the course content to start watching.</p>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Certificate Modal */}
      {openCertificate && (
         <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white relative max-w-4xl w-full rounded-lg shadow-2xl p-10 border-8 border-double border-gray-200 text-center">
               <button onClick={() => setOpenCertificate(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold">&times;</button>
               
               <div className="border-4 border-gray-800 p-8 h-full flex flex-col items-center justify-center bg-[#fffbf0]">
                  <h1 className="text-5xl font-serif font-bold text-gray-800 mb-2">Certificate of Completion</h1>
                  <p className="text-gray-600 text-lg uppercase tracking-widest mb-8">This is to certify that</p>
                  
                  <h2 className="text-4xl font-bold text-blue-600 mb-4 font-serif italic border-b-2 border-gray-300 pb-2 px-10">{userData.name}</h2>
                  
                  <p className="text-gray-600 text-lg mb-2">has successfully completed the course</p>
                  <h3 className="text-2xl font-bold text-gray-800 mb-8">{courseData.courseTitle}</h3>
                  
                  <div className="flex gap-20 items-end mt-10 w-full px-20">
                     <div className="flex flex-col items-center flex-1">
                        <img src="https://ui-avatars.com/api/?name=Edu+Stack&background=000&color=fff&rounded=true" alt="" className="w-16 h-16 mb-2 opacity-80" />
                        <div className="h-0.5 bg-gray-400 w-full"></div>
                        <p className="text-sm mt-2 text-gray-500">EduStack Director</p>
                     </div>
                     <div className="flex flex-col items-center flex-1">
                        <p className="text-xl font-serif mb-2">{new Date().toLocaleDateString()}</p>
                        <div className="h-0.5 bg-gray-400 w-full"></div>
                        <p className="text-sm mt-2 text-gray-500">Date Issued</p>
                     </div>
                  </div>
               </div>

               <div className="mt-6 flex justify-center gap-4 no-print">
                  <button onClick={() => window.print()} className="bg-blue-600 text-white px-8 py-3 rounded font-bold shadow hover:bg-blue-700">Print Certificate 🖨️</button>
                  <button onClick={() => setOpenCertificate(false)} className="bg-gray-200 text-gray-800 px-8 py-3 rounded font-bold hover:bg-gray-300">Close</button>
               </div>
            </div>
         </div>
      )}

      <Footer/>
    </>
  ) : <Loading/>
};

export default Player;
