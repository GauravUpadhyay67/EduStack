import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { assets } from '../../assets/assets';
import CourseCard from '../../components/student/CourseCard';
import SearchBar from '../../components/student/SearchBar';
import { AppContext } from '../../context/AppContext';

const CoursesList = () => {

  const { navigate, allCourses } = useContext(AppContext);
  const { input } = useParams()
  const [filteredCourse, setFilteredCourse] = useState([]);
  
  useEffect(() => {
    if(allCourses && allCourses.length > 0){
      const tempCourses = allCourses.slice();

      input ? 
        setFilteredCourse(
          tempCourses.filter(
            item => item.courseTitle.toLowerCase().includes(input.toLowerCase())
          )
        ) 
      : setFilteredCourse(tempCourses);

    }
  }, [allCourses, input])
  

  return (
    <>
    <div className='relative md:px-36 px-8 pt-20 text-left min-h-screen'>
      <div className='absolute inset-0 -z-10 h-full w-full bg-white overflow-hidden'>
        <div className='absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]'></div>
        <div className='absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-cyan-100 rounded-full blur-[100px] opacity-70'></div>
        <div className='absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] opacity-70'></div>
      </div>
      <div className='flex md:flex-row flex-col gap-6 items-start justify-between w-full'>
        <div>
        <h1 className='text-4xl font-semibold text-gray-800'>Course List</h1>
        <p className='text-gray-500'>
          <span className='text-blue-600 cursor-pointer' onClick={() => navigate('/')}>Home</span> / <span onClick={() => navigate('/course-list')}>Course List</span></p>
        </div>
        <SearchBar data={input}/>
      </div>

      { input && <div className='inline-flex items-center gap-4 px-4 py-2 border mt-8 -mb-8 text-gray-600'>
        <p>{input}</p>
        <img src={assets.cross_icon} alt="" className='cursor-pointer' onClick={() => navigate('/course-list')}/>
      </div> }

      <div className='grid grid-cols-1 sm:grid-cols-2 md:frid-cols-3 lg:grid-cols-4 my-16 gap-3 px-2 md:px-0'>
        {filteredCourse.map((course, index) => <CourseCard key={index} course={course} />)}
      </div>
    </div>
    </>
  )
}

export default CoursesList
