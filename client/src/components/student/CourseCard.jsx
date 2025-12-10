import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const CourseCard = ({ course }) => {

  const { currency, calculateRating } = useContext(AppContext);

  return (
    <Link to={`/course/${course._id}`} onClick={() => scrollTo(0, 0)} className='group flex flex-col bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 overflow-hidden'>
      <div className='relative w-full aspect-video overflow-hidden bg-gray-50/50'>
        {/* Blurred Background for ambiance */}
        <div className='absolute inset-0 overflow-hidden'>
          <img className='w-full h-full object-cover blur-xl opacity-40 transform scale-110' src={course.courseThumbnail} alt="" />
        </div>
        {/* Main Image - Fully Visible */}
        <img className='relative w-full h-full object-contain z-10 transition-transform duration-500 group-hover:scale-105' src={course.courseThumbnail} alt="" />
      </div>
      <div className='p-5 flex flex-col flex-1'>
        <h3 className='text-base font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors'>{course.courseTitle}</h3>
        <div className='flex items-center space-x-1 mb-auto'>
          <p className='font-bold text-gray-800 text-sm'>{calculateRating(course)}</p>
          <div className='flex space-x-0.5'>
            {[...Array(5)].map((_, index) => (
              <img key={index} src={index < calculateRating(course) ? assets.star : assets.star_blank} alt='' className='w-3.5 h-3.5' />
            ))}
          </div>
          <p className='text-gray-500 text-xs'>({course.courseRatings.length})</p>
        </div>
        <p className='text-lg font-bold text-gray-800 mt-3'>
          {currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}
        </p>
      </div>
    </Link>
  )
}

export default CourseCard
