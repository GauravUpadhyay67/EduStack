import ytdl from '@distube/ytdl-core';
import Course from "../models/Course.js";

// Get All Courses
export const getAllCourse = async (req, res) => {
    try {
        const courses = await Course.find({isPublished: true}).select(['-courseContent', '-enrolledStudents']);
        res.json({ success: true, courses });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
} 

// Get Course by Id
export const getCourseId = async (req, res) => {
    const { id } = req.params;
    try {
        const courseData = await Course.findById(id);
        // Remove lectureUrl if isPreview free is false
        courseData.courseContent.forEach(chapter => {
            chapter.chapterContent.forEach(lecture => {
                if(!lecture.isPreviewFree){
                    lecture.lectureUrl = "";
                }
            })
        })
        res.json({ success: true, courseData });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const getVideoDuration = async (req, res) => {
    const { url } = req.body;
    if (!url) return res.json({ success: false, message: "URL is required" });

    try {
        if(url.includes('youtube.com') || url.includes('youtu.be')){
            const info = await ytdl.getInfo(url);
            const seconds = info.videoDetails.lengthSeconds;
            const durationInMinutes = (seconds / 60).toFixed(2);
             return res.json({ success: true, duration: durationInMinutes });
        }
        res.json({ success: true, duration: 0, message: "Use YouTube URL" });
    } catch (error) {
        console.error("Error fetching duration:", error);
         res.json({ success: false, message: "Could not fetch duration" });
    }
}
