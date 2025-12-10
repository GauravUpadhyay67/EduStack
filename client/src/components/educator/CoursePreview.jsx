import humanizeDuration from "humanize-duration";
import { useContext, useState } from "react";
import YouTube from "react-youtube";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const CoursePreview = ({ courseData }) => {
  const { currency, calculateChapterTime } = useContext(AppContext);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const extractYouTubeVideoId = (url) => {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  if (!courseData) return null;

  return (
    <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-10 px-4 md:pt-10 pt-5 text-left bg-white border rounded-xl shadow-md overflow-hidden p-6">
      <div className="absolute top-0 left-0 w-full h-section-height z-0 bg-gradient-to-b from-cyan-100/70"></div>

      {/* Left Column */}
      <div className="max-w-xl z-10 text-gray-500 w-full">
        <h1 className="md:text-course-details-heading-large text-3xl font-bold text-gray-800">
          {courseData.courseTitle || "Untitled Course"}
        </h1>
        <p
          className="pt-4 md:text-base text-sm leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: courseData.courseDescription ? courseData.courseDescription.slice(0, 200) : "No description yet.",
          }}
        />

        {/* Dummy Review Section for Preview - Hidden as per request */}
        {/* <div className="flex items-center space-x-2 pt-3 pb-1 text-sm opacity-50">
          <p>5.0</p>
          <div className="flex">
            {[...Array(5)].map((_, index) => (
              <img key={index} src={assets.star} alt="" className="w-3.5 h-3.5" />
            ))}
          </div>
          <p className="text-blue-600">(0 ratings)</p>
          <p className="text-gray-500">0 students</p>
        </div> */}

        <p className="text-sm pt-2 text-gray-600">
          Created by <span className="text-blue-600 underline font-medium">You</span>
        </p>

        <div className="pt-8 text-gray-800">
          <h2 className="text-xl font-semibold mb-4">Course Structure</h2>
          <div className="space-y-3">
            {courseData.courseContent.length === 0 ? (
                <p className="text-gray-400 italic">No chapters added yet.</p>
            ) : (
                courseData.courseContent.map((chapter, index) => (
                <div key={index} className="border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden">
                    <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-gray-50 hover:bg-gray-100 transition"
                    onClick={() => toggleSection(index)}
                    >
                    <div className="flex items-center gap-3">
                        <img
                        className={`transform transition-transform duration-300 ${openSections[index] ? "rotate-180" : ""}`}
                        src={assets.down_arrow_icon}
                        alt="arrow icon"
                        width={14}
                        />
                        <p className="font-medium text-gray-700 md:text-base text-sm">{chapter.chapterTitle}</p>
                    </div>
                    <p className="text-xs text-gray-500">
                        {chapter.chapterContent.length} lectures • {calculateChapterTime(chapter)}
                    </p>
                    </div>

                    <div className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${openSections[index] ? "max-h-96" : "max-h-0"}`}>
                    <ul className="pl-10 pr-4 py-3 text-gray-600 border-t border-gray-200 space-y-2">
                        {chapter.chapterContent.length === 0 ? <li className="text-xs text-gray-400">No lectures yet</li> : chapter.chapterContent.map((lecture, idx) => (
                        <li key={idx} className="flex items-start gap-2 group">
                            <img src={assets.play_icon} alt="play icon" className="w-3.5 h-3.5 mt-1 opacity-70 group-hover:opacity-100 transition" />
                            <div className="flex items-center justify-between w-full text-gray-700 text-sm">
                            <p className="group-hover:text-blue-600 transition">{lecture.lectureTitle}</p>
                            <div className="flex gap-3 text-xs text-gray-400">
                                {lecture.isPreviewFree && (
                                <p
                                    onClick={() => setPlayerData({ videoId: extractYouTubeVideoId(lecture.lectureUrl) })}
                                    className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer hover:bg-blue-100 transition shadow-sm"
                                >
                                    Preview
                                </p>
                                )}
                                <p>
                                {lecture.lectureDuration ? humanizeDuration(lecture.lectureDuration * 60 * 1000, { units: ["h", "m"], round: true }) : '0m'}
                                </p>
                            </div>
                            </div>
                        </li>
                        ))}
                    </ul>
                    </div>
                </div>
                ))
            )}
          </div>
        </div>

        <div className="py-12">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Description</h3>
          <p
            className="rich-text text-gray-600 leading-relaxed text-sm md:text-base"
            dangerouslySetInnerHTML={{
              __html: courseData.courseDescription || "<p>No description added.</p>",
            }}
          />
        </div>
      </div>

      {/* Right Column */}
      <div className="max-w-[420px] z-10 shadow-lg rounded-xl overflow-hidden bg-white w-full sticky top-24">
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
             courseData.image ? 
             <img src={URL.createObjectURL(courseData.image)} alt="Course Thumbnail" className="w-full object-cover" /> 
             : 
             <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">No Thumbnail</div>
        )}

        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
             <img src={assets.time_left_clock_icon} alt="time left clock icon" className="w-4" />
            <p className="text-red-500 text-sm"><span className="font-semibold">5 days</span> remaining at this price!</p>
          </div>

          <div className="flex gap-3 items-end mb-6">
            <p className="text-gray-800 text-4xl font-bold">
              {currency}
              {(courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100).toFixed(2)}
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
                 <p>New</p>
              </div>
              <div className="flex items-center gap-2">
                 <img src={assets.time_clock_icon} alt="clock icon" className="w-4 opacity-70"/>
                 <p>{calculateChapterTime ? 'Calculated' : 'Total 0h'}</p> {/* Placeholder for preview */}
              </div>
              <div className="flex items-center gap-2">
                 <img src={assets.lesson_icon} alt="lesson icon" className="w-4 opacity-70"/>
                 <p>{courseData.courseContent.reduce((acc, curr) => acc + curr.chapterContent.length, 0)} lessons</p>
              </div>
               <div className="flex items-center gap-2">
                 <img src={assets.profile_icon || assets.user_icon} alt="access icon" className="w-4 opacity-70"/>
                 <p>Lifetime Access</p>
              </div>
            </div>

          <button className="w-full py-4 rounded-lg font-bold bg-blue-600 text-white shadow-md cursor-not-allowed opacity-80">
             Enroll Now (Preview)
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
  );
};

export default CoursePreview;
