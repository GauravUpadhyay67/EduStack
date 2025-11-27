import { useContext } from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const CourseCard = ({course}) => {

  const { currency, calculateRating } = useContext(AppContext);

  return (
    <Link to={`/course/${course._id}`} onClick={() => scrollTo(0,0)} className='flex flex-col gap-2 bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-all duration-300'>
      <img className='w-full aspect-video object-cover rounded-md' src={course.courseThumbnail} alt="" />
      <div className='p-3 text-left'>
        <h3 className='text-base font-semibold'>{course.courseTitle}</h3>
        <div className='flex items-center space-x-2'>
          <p>{calculateRating(course)}</p>
          <div className='flex'>
            {[...Array(5)].map((_, index) => (
              <img key={index} src={index < calculateRating(course) ? assets.star : assets.star_blank} alt='' className='w-3.5 h-3.5' />
            ))}
          </div>
          <p className='text-gray-500'>({course.courseRatings.length})</p>
        </div>
        <p className='text-base font-semibold text-gray-800'>
          {currency}{(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}
        </p>
      </div>
    </Link>
  )
}

export default CourseCard
