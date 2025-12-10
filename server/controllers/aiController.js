import { GoogleGenerativeAI } from "@google/generative-ai";

const generateCourseOutline = async (req, res) => {
    const { topic } = req.body;
    
    // Check if API key is present; if not, return mock data for testing UI
    if (!process.env.GEMINI_API_KEY) {
        // Return mock data so the UI can still be tested without a key
        return res.json({
            success: true,
            courseTitle: `${topic} Masterclass`,
            chapters: [
                {
                    chapterTitle: "Introduction",
                    chapterContent: [
                         { lectureTitle: "Course Overview", lectureDuration: 5, lectureUrl: "https://youtu.be/example", isPreviewFree: true },
                         { lectureTitle: "Prerequisites", lectureDuration: 10, lectureUrl: "https://youtu.be/example", isPreviewFree: true }
                    ]
                },
                {
                    chapterTitle: "Core Concepts",
                    chapterContent: [
                        { lectureTitle: "Getting Started", lectureDuration: 15, lectureUrl: "https://youtu.be/example", isPreviewFree: false }
                    ]
                }
            ]
        });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Generate a detailed course outline for "${topic}". 
        Return ONLY a valid JSON object. Do not include markdown formatting (like \`\`\`json).
        The structure must be:
        {
            "courseTitle": "Detailed Title",
            "chapters": [
                {
                    "chapterTitle": "Chapter Name",
                    "chapterContent": [
                        { "lectureTitle": "Lecture Name", "lectureDuration": 10, "lectureUrl": "", "isPreviewFree": false }
                    ]
                }
            ]
        }
        Generate at least 3 chapters with 2-3 lectures each.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Cleanup potential markdown backticks if Gemini adds them despite instructions
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        
        const courseData = JSON.parse(cleanText);

        res.json({ success: true, ...courseData });

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.json({ success: false, message: "Failed to generate course. Try again." });
    }
};

const generateCourseDescription = async (req, res) => {
    const { topic } = req.body;

    if (!process.env.GEMINI_API_KEY) {
        return res.json({
            success: true,
            description: `<p><strong>${topic}</strong> is a comprehensive course designed to master the fundamentals and advanced concepts. In this course, you will learn through hands-on projects and real-world examples.</p><p>By the end of this course, you will be able to build professional applications and have a deep understanding of the core principles.</p>`
        });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Generate a professional, engaging course description for a course titled "${topic}". 
        The output should be in HTML format (using <p>, <strong>, <ul>, <li> tags) suitable for a rich text editor.
        Keep it concise (about 100-150 words). Do not include markdown code blocks.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const cleanText = text.replace(/```html/g, "").replace(/```/g, "").trim();

        res.json({ success: true, description: cleanText });

    } catch (error) {
        console.error("AI Generation Error:", error);
        res.json({ success: false, message: "Failed to generate description." });
    }
};

export { generateCourseDescription, generateCourseOutline };

