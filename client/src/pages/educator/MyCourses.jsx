import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';
import { AppContext } from '../../context/AppContext';

const MyCourses = () => {

  const { currency, backendUrl, isEducator, getToken } = useContext(AppContext);
  const [courses, setCourses] = useState(null);

  const fetchEducatorCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/educator/courses', 
        {headers: { Authorization: `Bearer ${token}` }}
      )

      data.success && setCourses(data.courses)
      
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if(isEducator){
      fetchEducatorCourses()
    }
  }, [isEducator])

  return courses ? (
    <div className='h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='w-full'>
        <h2 className='text-xl font-bold text-gray-800 mb-4'>My Courses</h2>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
          <table className='w-full text-left text-sm text-gray-600'>
            <thead className='bg-gray-50 text-gray-700 font-medium border-b border-gray-200'>
            <tr>
              <th className='px-6 py-3 truncate'>All Courses</th>
              <th className='px-6 py-3 truncate'>Earnings</th>
              <th className='px-6 py-3 truncate'>Students</th>
              <th className='px-6 py-3 truncate'>Published On</th>
              <th className='px-6 py-3 truncate'>Action</th>
            </tr>
            </thead>

            <tbody className='divide-y divide-gray-100'>
              {courses.map((course, index) => (
                <tr key={course._id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 flex items-center gap-3 truncate'>
                    <img src={course.courseThumbnail} alt="Course Image" className='w-16 h-10 object-cover rounded' />
                    <span className='truncate hidden md:block font-medium text-gray-900'>
                      {course.courseTitle}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    {currency} {Math.floor(course.enrolledStudents.length * (course.coursePrice - course.discount * course.coursePrice / 100))}
                  </td>
                  <td className='px-6 py-4'>
                    {course.enrolledStudents.length}
                  </td>
                  <td className='px-6 py-4'>
                    {new Date(course.createdAt).toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4'>
                    <Link 
                      to={`/educator/edit-course/${course._id}`}
                      className='text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors'
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  ) : <Loading/>
}

export default MyCourses