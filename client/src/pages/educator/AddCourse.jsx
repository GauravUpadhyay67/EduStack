import axios from 'axios';
import Quill from 'quill';
import { useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import uniqid from 'uniqid';
import { assets } from '../../assets/assets';
import CoursePreview from '../../components/educator/CoursePreview';
import { AppContext } from '../../context/AppContext';


const AddCourse = () => {
  const { backendUrl, getToken } = useContext(AppContext);
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  // --- State for Wizard ---
  const [step, setStep] = useState(0); // 0: Basic Details, 1: Curriculum, 2: Publish

  // --- Course Data ---
  const [courseTitle, setCourseTitle] = useState('');
  const [coursePrice, setCoursePrice] = useState(0);
  const [image, setImage] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- Lecture Popup State ---
  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureToEditIndex, setLectureToEditIndex] = useState(null);

  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: '',
    lectureDuration: '',
    lectureUrl: '',
    isPreviewFree: false,
  });

  // ... (AI functions remain same)

  const handleLecture = (action, chapterId, lectureIndex) => {
    if(action === 'add'){
      setCurrentChapterId(chapterId);
      setLectureToEditIndex(null); // Reset edit index
      setLectureDetails({
        lectureTitle: '',
        lectureDuration: '',
        lectureUrl: '',
        isPreviewFree: false,
      });
      setShowPopup(true)
    }
    else if(action === 'remove'){
        const updatedChapters = chapters.map((chapter) => {
            if (chapter.chapterId === chapterId) {
                const newContent = [...chapter.chapterContent];
                newContent.splice(lectureIndex, 1);
                return { ...chapter, chapterContent: newContent };
            }
            return chapter;
        });
        setChapters(updatedChapters);
    }
    else if(action === 'edit'){
        const chapter = chapters.find(ch => ch.chapterId === chapterId);
        const lecture = chapter.chapterContent[lectureIndex];
        setCurrentChapterId(chapterId);
        setLectureToEditIndex(lectureIndex);
        setLectureDetails({
            lectureTitle: lecture.lectureTitle,
            lectureDuration: lecture.lectureDuration,
            lectureUrl: lecture.lectureUrl,
            isPreviewFree: lecture.isPreviewFree,
        });
        setShowPopup(true);
    }
  }

  const addLecture = () => {
    const updatedChapters = chapters.map((chapter) => {
      if (chapter.chapterId === currentChapterId) {
        const newContent = [...chapter.chapterContent];
        
        if (lectureToEditIndex !== null) {
            // Edit existing lecture
            newContent[lectureToEditIndex] = {
                ...newContent[lectureToEditIndex],
                ...lectureDetails,
            };
        } else {
            // Add new lecture
             const newLecture = {
              ...lectureDetails,
              lectureOrder: chapter.chapterContent.length + 1,
              lectureId: uniqid(),
            };
            newContent.push(newLecture);
        }

        return {
          ...chapter,
          chapterContent: newContent,
        };
      }
      return chapter;
    });
  
    setChapters(updatedChapters);
    setShowPopup(false);
    setLectureDetails({
      lectureTitle: '',
      lectureDuration: '',
      lectureUrl: '',
      isPreviewFree: false,
    });
  };

  // --- AI Generation Function ---
  const handleAutoGenerate = async () => {
    if (!courseTitle) {
      toast.error("Please enter a Course Title first.");
      return;
    }
    try {
        setIsAiLoading(true);
        const token = await getToken();
        // Call our new AI endpoint
        const { data } = await axios.post(backendUrl + '/api/ai/generate-outline', 
            { topic: courseTitle },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
            // Map the AI response to our internal structure
            // We need to ensure IDs are unique
            const generatedChapters = data.chapters.map((chap, idx) => ({
                chapterId: uniqid(),
                chapterTitle: chap.chapterTitle,
                chapterOrder: idx + 1,
                collapsed: false,
                chapterContent: chap.chapterContent.map((lec, lIdx) => ({
                    lectureId: uniqid(),
                    lectureTitle: lec.lectureTitle,
                    lectureDuration: lec.lectureDuration,
                    lectureUrl: lec.lectureUrl || '', // AI might leave empty
                    isPreviewFree: lec.isPreviewFree,
                    lectureOrder: lIdx + 1
                }))
            }));
            
            setChapters(generatedChapters);
            toast.success("Curriculum generated successfully!");
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error("Failed to generate curriculum. " + error.message);
    } finally {
        setIsAiLoading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!courseTitle) {
        toast.error("Please enter a Course Title first.");
        return;
    }
    try {
        setIsAiLoading(true);
        const token = await getToken();
        // Call our new AI endpoint
        const { data } = await axios.post(backendUrl + '/api/ai/generate-description', 
            { topic: courseTitle },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
            quillRef.current.root.innerHTML = data.description;
            toast.success("Description generated successfully!");
        } else {
            toast.error(data.message);
        }
    } catch (error) {
        toast.error("Failed to generate description. " + error.message);
    } finally {
        setIsAiLoading(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if(!image){
        toast.error('Thumbnail Not Selected');
        return;
      }

      const courseData = {
        courseTitle,
        courseDescription: quillRef.current.root.innerHTML,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters,
        isPublished: true,
      }

      const formData = new FormData()
      formData.append('courseData', JSON.stringify(courseData))
      formData.append('image', image)

      setIsLoading(true);

      const token = await getToken();
      const { data } = await axios.post(backendUrl + '/api/educator/add-course', formData,
        { headers: { Authorization: `Bearer ${token}` }})

      if(data.success){
        toast.success(data.message)
        // Reset everything
        setCourseTitle('')
        setCoursePrice(0)
        setDiscount(0)
        setImage(null)
        setChapters([])
        setStep(0); // Go back to start
        quillRef.current.root.innerHTML = ""
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
        setIsLoading(false);
    }
  }

  useEffect(() => {
    if(!quillRef.current && editorRef.current){
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
      });
    }
  }, [])

  // --- Render Steps ---
  return (
    <div className='h-screen overflow-scroll flex flex-col items-start justify-start md:p-8 p-4 pt-8'>
      
      {/* Stepper Header */}
      <div className="w-full flex justify-center mb-8">
        <div className="flex items-center space-x-4">
             <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 0 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'}`}>1</div>
             <div className={`w-20 h-1 bg-gray-300 ${step >= 1 ? '!bg-blue-600' : ''}`}></div>
             <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 1 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'}`}>2</div>
             <div className={`w-20 h-1 bg-gray-300 ${step >= 2 ? '!bg-blue-600' : ''}`}></div>
             <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step >= 2 ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-400'}`}>3</div>
        </div>
      </div>
      
      {/* Step 1: Basic Details */}
      {step === 0 && (
          <div className="w-full max-w-3xl bg-white p-6 rounded shadow-sm border mx-auto">
             <h2 className="text-2xl font-bold mb-6">Course Basics</h2>
             
             <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-1'>
                    <label className="font-medium">Course Title</label>
                    <input onChange={e => setCourseTitle(e.target.value)} value={courseTitle} type='text' placeholder='e.g., Ultimate React Guide' className='outline-none py-2 px-3 rounded border border-gray-300 focus:border-blue-500' required />
                </div>
                
                <div className='flex flex-col gap-1'>
                    <div className='flex justify-between items-center'>
                      <label className="font-medium">Course Description</label>
                      <button 
                         onClick={handleGenerateDescription}
                         disabled={isAiLoading}
                         className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100 hover:bg-purple-100 transition"
                      >
                        {isAiLoading ? 'Writing...' : '✨ Auto-Write'}
                      </button>
                    </div>
                    <div className="h-48 mb-12">
                         <div ref={editorRef} className='h-full'></div>
                    </div>
                </div>

                <div className='flex items-center gap-4 mt-4'>
                    <div className='flex flex-col gap-1 w-1/3'>
                        <label className="font-medium">Price ($)</label>
                        <input type="number" onChange={e => setCoursePrice(e.target.value)} value={coursePrice} placeholder='0' className='outline-none py-2 px-3 rounded border border-gray-300' />
                    </div>
                     <div className='flex flex-col gap-1 w-1/3'>
                        <label className="font-medium">Discount (%)</label>
                        <input type="number" onChange={e => setDiscount(e.target.value)} value={discount} placeholder='0' min={0} max={100} className='outline-none py-2 px-3 rounded border border-gray-300' />
                    </div>
                     <div className='flex flex-col gap-1 w-1/3'>
                        <label className="font-medium">Thumbnail</label>
                         <label htmlFor="thumbnailImage" className='flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-2 border border-blue-200 rounded text-blue-600 hover:bg-blue-100 transition'>
                             {image ? <span className='truncate'>{image.name}</span> : <span>Upload Image</span>}
                            <input type="file" id='thumbnailImage' onChange={e => {
                                const file = e.target.files[0];
                                if(file) {
                                    const img = new Image();
                                    img.src = URL.createObjectURL(file);
                                    img.onload = () => {
                                        const aspect = img.width / img.height;
                                        // Allow small tolerance (1.7 to 1.85 usually covers 16:9)
                                        if (aspect > 1.7 && aspect < 1.85) {
                                             setImage(file);
                                        } else {
                                            toast.error("Invalid Aspect Ratio! Please upload a 16:9 image.");
                                            setImage(null);
                                        }
                                    };
                                }
                            }} accept='image/*' hidden />
                         </label>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button onClick={() => setStep(1)} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Next: Curriculum &rarr;</button>
                </div>
             </div>
          </div>
      )}

      {/* Step 2: Curriculum */}
      {step === 1 && (
          <div className="w-full max-w-3xl bg-white p-6 rounded shadow-sm border mx-auto">
             <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold">Curriculum</h2>
                 <button 
                    onClick={handleAutoGenerate} 
                    disabled={isAiLoading}
                    className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded border border-purple-200 hover:bg-purple-200 transition disabled:opacity-50"
                 >
                    {isAiLoading ? (
                        <>Generatng...</>
                    ) : (
                        <>✨ AI Auto-Generate</>
                    )}
                 </button>
             </div>
             
             <div className="mb-8">
               {chapters.length === 0 ? (
                   <div className="text-center py-10 bg-gray-50 rounded border border-dashed border-gray-300 text-gray-500">
                       <p>No chapters yet.</p>
                       <p className="text-sm">Click "AI Auto-Generate" or add manually.</p>
                   </div>
               ) : (
                chapters.map((chapter, chapterIndex) => (
                    <div key={chapterIndex} className='bg-white border rounded-lg mb-4'>
                      <div className='flex justify-between items-center p-4 border-b bg-gray-50'>
                        <div className='flex items-center'>
                          <img onClick={() => handleChapter('toggle', chapter.chapterId)} src={assets.dropdown_icon} width={14} alt="" className={`mr-2 cursor-pointer transition-all ${chapter.collapsed && "-rotate-90"}`}/>
                          <span className='font-semibold'>
                            {chapterIndex + 1}. {chapter.chapterTitle}
                          </span>
                        </div>
                        <span className='text-gray-500 text-sm mr-auto ml-2'>({chapter.chapterContent.length} lectures)</span>
                        <img src={assets.cross_icon} alt="" className='cursor-pointer opacity-50 hover:opacity-100' onClick={() => handleChapter('remove', chapter.chapterId)}/>
                      </div>
                      {!chapter.collapsed && (
                        <div className='p-4 space-y-2'>
                          {chapter.chapterContent.map((lecture, lectureIndex) => (
                            <div key={lectureIndex} className='flex justify-between items-center p-2 hover:bg-gray-50 rounded'>
                              <div className="flex-1">
                                <span className="font-medium">
                                  {lectureIndex + 1}. {lecture.lectureTitle}
                                </span>
                                <span className="text-xs text-gray-400 ml-2">
                                  {lecture.lectureDuration}m • {lecture.isPreviewFree ? 'Free' : 'Paid'}
                                </span>
                              </div>
                              <div className='flex items-center gap-2'>
                                <span className='text-xs text-blue-500 cursor-pointer hover:underline' onClick={() => handleLecture('edit', chapter.chapterId, lectureIndex)}>Edit</span>
                                <img src={assets.cross_icon} alt="" className='cursor-pointer w-3 opacity-40 hover:opacity-100' onClick={() => handleLecture('remove', chapter.chapterId, lectureIndex)} />
                              </div>
                            </div>
                          ))}
                          <div className='text-center text-blue-600 text-sm font-medium cursor-pointer p-2 hover:bg-blue-50 rounded dashed border border-blue-200 mt-2' onClick={
                            () => handleLecture('add', chapter.chapterId)
                          }>+ Add Lecture</div>
                        </div>
                      )}
                    </div>
                  ))
               )}
                <div onClick={() => handleChapter('add')} className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded text-center cursor-pointer hover:border-blue-400 hover:text-blue-500 transition">
                    + Add New Chapter
                </div>
             </div>

             <div className="flex justify-between mt-6">
                <button onClick={() => setStep(0)} className="text-gray-600 px-6 py-2 hover:underline">&larr; Back</button>
                <button onClick={() => setStep(2)} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Next: Review & Publish &rarr;</button>
             </div>
          </div>
      )}

      {/* Step 3: Publish */}
      {step === 2 && (
          <div className="w-full max-w-5xl bg-white p-6 rounded shadow-sm border mx-auto text-center">
             <h2 className="text-3xl font-bold mb-4">Ready to Launch?</h2>
             <p className="text-gray-600 mb-8">Review your details below.</p>
             
             <h2 className="text-3xl font-bold mb-4">Ready to Launch?</h2>
             <p className="text-gray-600 mb-8">This is how your course will look to students.</p>
             
             <CoursePreview courseData={{
                courseTitle,
                courseDescription: quillRef.current?.root?.innerHTML,
                coursePrice,
                discount,
                image,
                courseContent: chapters
             }} />

             <div className="flex justify-between mt-6">
                <button onClick={() => setStep(1)} className="text-gray-600 px-6 py-2 hover:underline">&larr; Back to Curriculum</button>
                <button onClick={handleSubmit} disabled={isLoading} className="bg-green-600 text-white px-8 py-3 rounded text-lg font-bold hover:bg-green-700 transition shadow-lg disabled:opacity-50">
                    {isLoading ? 'Publishing...' : '🚀 Publish Course'}
                </button>
             </div>
          </div>
      )}

      {/* Lecture Popup */}
      {showPopup && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/50 z-50 backdrop-blur-sm'>
            <div className='bg-white text-gray-700 p-6 rounded-lg shadow-xl relative w-full max-w-md'>
                <h2 className='text-lg font-bold mb-4'>{lectureToEditIndex !== null ? 'Edit Lecture' : 'Add New Lecture'}</h2>

                <div className='space-y-4'>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input type="text" className='w-full border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 py-2 px-3 transition' value={lectureDetails.lectureTitle} onChange={(e) => setLectureDetails({...lectureDetails, lectureTitle: e.target.value})} placeholder="Introduction to..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                             <input type="number" className='w-full border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 py-2 px-3' value={lectureDetails.lectureDuration} onChange={(e) => setLectureDetails({...lectureDetails, lectureDuration: e.target.value})} placeholder="0" />
                        </div>
                         <div className="flex items-center pt-6">
                            <input type="checkbox" id="free-preview" className='w-4 h-4 text-blue-600 rounded focus:ring-blue-500' checked={lectureDetails.isPreviewFree} onChange={(e) => setLectureDetails({...lectureDetails, isPreviewFree: e.target.checked})} />
                            <label htmlFor="free-preview" className="ml-2 text-sm text-gray-700 select-none">Free Preview?</label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                        <input 
                            type="text" 
                            className='w-full border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 py-2 px-3' 
                            value={lectureDetails.lectureUrl} 
                            onChange={(e) => setLectureDetails({...lectureDetails, lectureUrl: e.target.value})} 
                            onBlur={async (e) => {
                                const url = e.target.value;
                                if(url && !lectureDetails.lectureDuration) {
                                    try {
                                        const token = await getToken();
                                        const { data } = await axios.post(backendUrl + '/api/course/new/video-duration', 
                                            { url },
                                            { headers: { Authorization: `Bearer ${token}` } }
                                        );
                                        if(data.success && data.duration) {
                                            setLectureDetails(prev => ({ ...prev, lectureDuration: data.duration }));
                                            toast.success(`Duration fetched: ${data.duration} mins`);
                                        }
                                    } catch (err) {
                                        // Silent fail or log
                                        console.error('Failed to fetch duration');
                                    }
                                }
                            }}
                            placeholder="https://youtube.com/..." 
                        />
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setShowPopup(false)} className='px-4 py-2 text-gray-500 hover:text-gray-700'>Cancel</button>
                    <button onClick={addLecture} type='button' className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition'>{lectureToEditIndex !== null ? 'Update' : 'Add'}</button>
                </div>

                <button onClick={() => setShowPopup(false)} className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'>
                    <img src={assets.cross_icon} alt="Close" className="w-4 h-4" />
                </button>
            </div>
        </div>
      )}

    </div>
  )
}

export default AddCourse