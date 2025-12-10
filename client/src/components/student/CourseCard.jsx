import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const CourseCard = ({ course }) => {

  const { currency, calculateRating } = useContext(AppContext);

  return (
    <Link to={`/course/${course._id}`} onClick={() => scrollTo(0, 0)} className='group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-[0_15px_40px_rgb(0,0,0,0.1)] transition-all duration-300 overflow-hidden relative hover:-translate-y-1'>
      
      {/* Thumbnail Section */}
      <div className='relative w-full aspect-[16/9] overflow-hidden bg-gray-50'>
        {/* Main Image */}
        <img className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' src={course.courseThumbnail} alt="" />
        
        {/* Overlay Gradient on Hover */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4'>
           <span className='text-white font-semibold text-sm'>View Course Details</span>
        </div>
      </div>

      {/* Content Section */}
      <div className='p-5 flex flex-col flex-1 relative'>
        {/* Educator Badge */}
        <div className='absolute -top-5 right-4'>
             <div className='bg-white p-1 rounded-full shadow-md'>
                <img src={assets.profile_img_1} alt="Educator" className='w-8 h-8 rounded-full border border-gray-100' />
             </div>
        </div>

        {/* Category/Tag (Static for now, can be dynamic) */}
        <span className='text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2'>Course</span>

        <h3 className='text-lg font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors leading-snug'>
            {course.courseTitle}
        </h3>

        {/* Ratings */}
        <div className='flex items-center space-x-1 mb-4'>
          <p className='font-bold text-gray-800 text-sm'>{calculateRating(course)}</p>
          <div className='flex space-x-0.5'>
            {[...Array(5)].map((_, index) => (
              <img key={index} src={index < calculateRating(course) ? assets.star : assets.star_blank} alt='' className='w-3.5 h-3.5' />
            ))}
          </div>
          <p className='text-gray-400 text-xs font-medium'>({course.courseRatings.length} reviews)</p>
        </div>

        {/* Footer: Price and Meta */}
        <div className='flex items-center justify-between mt-auto pt-4 border-t border-gray-50'>
            <div className='flex flex-col'>
                <p className='text-xl font-bold text-gray-900'>
                  {currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}
                </p>
                <p className='text-xs text-gray-400 line-through font-medium'>
                   {currency}{course.coursePrice.toFixed(2)}
                </p>
            </div>
            
             <div className='bg-blue-50 p-2 rounded-lg group-hover:bg-blue-600 transition-colors duration-300'>
                 <img src={assets.arrow_icon} alt="View" className='w-4 h-4 transform -rotate-90 group-hover:invert transition-all' />
             </div>
        </div>
      </div>
    </Link>
  )
}

export default CourseCard
