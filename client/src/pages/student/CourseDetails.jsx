import axios from "axios";
import humanizeDuration from "humanize-duration";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import YouTube from "react-youtube";
import { assets } from "../../assets/assets";
import Footer from "../../components/student/Footer";
import Loading from "../../components/student/Loading";
import { AppContext } from "../../context/AppContext";

const CourseDetails = () => {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);

  const {
    allCourses,
    calculateRating,
    calculateChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
    currency,
    backendUrl,
    userData,
    getToken
  } = useContext(AppContext);

  const fetchCourseData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/course/' + id);
      if (data.success) {
        setCourseData(data.courseData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const enrollCourse = async () => {
    try {
      if (!userData) {
        return toast.warn('Login to Enroll');
      }
      if (isAlreadyEnrolled) {
        return toast.warn('Already Enrolled');
      }

      const token = await getToken();
      const { data } = await axios.post(
        backendUrl + '/api/user/purchase',
        { courseId: courseData._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        const { session_url } = data;
        window.location.replace(session_url);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  useEffect(() => {
    if (userData && courseData) {
      setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData._id));
    }
  }, [userData, courseData]);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // ✅ YouTube Video ID Extractor
  const extractYouTubeVideoId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return courseData ? (
    <>
      <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-30 pt-20 text-left">
        <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-cyan-100/70"></div>

        {/* Left Column */}
        <div className="max-w-xl z-10 text-gray-500 w-full">
          <h1 className="md:text-course-details-heading-large text-3xl font-bold text-gray-800">
            {courseData.courseTitle}
          </h1>
          <p
            className="pt-4 md:text-base text-sm leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: courseData.courseDescription.slice(0, 200),
            }}
          />

          {/* Review and Ratings */}
          {courseData.courseRatings.length > 0 && (
            <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
              <p className="font-semibold text-gray-800">{calculateRating(courseData)}</p>
              <div className="flex">
                {[...Array(5)].map((_, index) => (
                  <img
                    key={index}
                    src={
                      index < Math.floor(calculateRating(courseData))
                        ? assets.star
                        : assets.star_blank
                    }
                    alt=""
                    className="w-3.5 h-3.5"
                  />
                ))}
              </div>
              <p className="text-gray-500">
                ({courseData.courseRatings.length}{" "}
                {courseData.courseRatings.length > 1 ? "ratings" : "rating"})
              </p>
              <span className="text-gray-300">|</span>
              <p className="text-gray-500">
                {courseData.enrolledStudents.length}{" "}
                {courseData.enrolledStudents.length > 1 ? "students" : "student"}
              </p>
            </div>
          )}

          <p className="text-sm pt-2 text-gray-600">
            Created by{" "}
            <span className="text-blue-600 underline font-medium cursor-pointer">
               EduStack
            </span>
          </p>

          <div className="pt-8 text-gray-800">
            <h2 className="text-xl font-semibold mb-4">Course Structure</h2>
            <div className="space-y-3">
              {courseData.courseContent.map((chapter, index) => (
                <div
                  key={index}
                  className="border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden"
                >
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-gray-50 hover:bg-gray-100 transition"
                    onClick={() => toggleSection(index)}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        className={`transform transition-transform duration-300 ${
                          openSections[index] ? "rotate-180" : ""
                        }`}
                        src={assets.down_arrow_icon}
                        alt="arrow icon"
                        width={14}
                      />
                      <p className="font-medium text-gray-700 md:text-base text-sm">
                        {chapter.chapterTitle}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {chapter.chapterContent.length} lectures • {calculateChapterTime(chapter)}
                    </p>
                  </div>

                  <div
                    className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${
                      openSections[index] ? "max-h-96" : "max-h-0"
                    }`}
                  >
                    <ul className="pl-10 pr-4 py-3 text-gray-600 border-t border-gray-200 space-y-2">
                      {chapter.chapterContent.map((lecture, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 group"
                        >
                          <img
                            src={assets.play_icon}
                            alt="play icon"
                            className="w-3.5 h-3.5 mt-1 opacity-70 group-hover:opacity-100 transition"
                          />
                          <div className="flex items-center justify-between w-full text-gray-700 text-sm">
                            <p className="group-hover:text-blue-600 transition">{lecture.lectureTitle}</p>
                            <div className="flex gap-3 text-xs text-gray-400">
                              {lecture.isPreviewFree && (
                                <p
                                  onClick={() =>
                                    setPlayerData({
                                      videoId: extractYouTubeVideoId(
                                        lecture.lectureUrl
                                      ),
                                    })
                                  }
                                  className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer hover:bg-blue-100 transition shadow-sm"
                                >
                                  Preview
                                </p>
                              )}
                              <p>
                                {humanizeDuration(
                                  lecture.lectureDuration * 60 * 1000,
                                  { units: ["h", "m"], round: true }
                                )}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="py-12">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Description
            </h3>
            <p
              className="rich-text text-gray-600 leading-relaxed text-sm md:text-base"
              dangerouslySetInnerHTML={{
                __html: courseData.courseDescription,
              }}
            />
          </div>
        </div>

        {/* Right Column (Sticky) */}
        <div className="max-w-course-card z-10 shadow-lg rounded-xl overflow-hidden bg-white min-w-[300px] sm:min-w-[380px] sticky top-24">
          {playerData ? (
            <div className="w-full aspect-video">
              <YouTube
                videoId={playerData.videoId}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: { autoplay: 1 }
                }}
                className="w-full h-full"
              />
            </div>

          ) : (
            <img src={courseData.courseThumbnail} alt="" className="w-full h-auto object-cover" />
          )}

          <div className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <img
                src={assets.time_left_clock_icon}
                alt="time left clock icon"
                className="w-4"
              />
              <p className="text-red-500 text-sm">
                <span className="font-semibold">5 days</span> remaining at this price!
              </p>
            </div>

            <div className="flex gap-3 items-end mb-6">
              <p className="text-gray-800 text-4xl font-bold">
                {currency}
                {(
                  courseData.coursePrice -
                  (courseData.discount * courseData.coursePrice) / 100
                ).toFixed(2)}
              </p>
              <div className="flex flex-col items-start pb-1">
                <p className="text-base text-gray-400 line-through">
                    {currency}
                    {courseData.coursePrice}
                </p>
                <p className="text-sm text-green-600 font-medium">
                    {courseData.discount}% off
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                 <img src={assets.star} alt="star icon" className="w-4 opacity-70"/>
                 <p>{calculateRating(courseData) > 0 ? calculateRating(courseData) : 'New'}</p>
              </div>
              <div className="flex items-center gap-2">
                 <img src={assets.time_clock_icon} alt="clock icon" className="w-4 opacity-70"/>
                 <p>{calculateCourseDuration(courseData)}</p>
              </div>
              <div className="flex items-center gap-2">
                 <img src={assets.lesson_icon} alt="lesson icon" className="w-4 opacity-70"/>
                 <p>{calculateNoOfLectures(courseData)} lessons</p>
              </div>
               <div className="flex items-center gap-2">
                 <img src={assets.profile_icon || assets.user_icon} alt="access icon" className="w-4 opacity-70"/>
                 <p>Lifetime Access</p>
              </div>
            </div>

            <button
              onClick={enrollCourse}
              className={`w-full py-4 rounded-lg font-bold text-white shadow-md transition-all ${
                  isAlreadyEnrolled ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]'
              }`}
            >
              {isAlreadyEnrolled ? "Continue Learning" : "Enroll Now"}
            </button>

            <div className="pt-6 border-t mt-6">
              <p className="text-sm font-semibold text-gray-800 mb-3">
                This course includes:
              </p>
              <ul className="text-sm text-gray-500 space-y-2 list-none">
                <li className="flex gap-2 items-center">✓ <span>Lifetime access with updates</span></li>
                <li className="flex gap-2 items-center">✓ <span>Step-by-step project guidance</span></li>
                <li className="flex gap-2 items-center">✓ <span>Downloadable resources</span></li>
                <li className="flex gap-2 items-center">✓ <span>Completion Certificate</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  ) : (
    <Loading />
  );
};

export default CourseDetails;
