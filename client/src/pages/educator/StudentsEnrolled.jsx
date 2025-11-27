import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Loading from '../../components/student/Loading';
import { AppContext } from '../../context/AppContext';

const StudentsEnrolled = () => {

  const { backendUrl, getToken, isEducator } = useContext(AppContext)
  const [enrolledStudents, setEnrolledStudents] = useState(null);

  const fetchEnrolledStudents = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/educator/enrolled-students', 
        {headers: { Authorization: `Bearer ${token}` }}
      )

      if(data.success){
        setEnrolledStudents(data.enrolledStudents.reverse())
      } else {
        toast.error(data.message)
      }
      
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if(isEducator){
      fetchEnrolledStudents()
    }
  }, [isEducator])

  return enrolledStudents ? (
    <div className='min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='w-full'>
        <h2 className='text-xl font-bold text-gray-800 mb-4'>Students Enrolled</h2>
        <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <table className='w-full text-left text-sm text-gray-600'>
          <thead className='bg-gray-50 text-gray-700 font-medium border-b border-gray-200'>
          <tr>
            <th className='px-6 py-3 hidden sm:table-cell'>#</th>
            <th className='px-6 py-3'>Student Name</th>
            <th className='px-6 py-3'>Course Title</th>
            <th className='px-6 py-3 hidden sm:table-cell'>Date</th>
          </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {enrolledStudents.map((item, index) => (
              
              <tr key={index} className='hover:bg-gray-50'>
                <td className='px-6 py-4 hidden sm:table-cell'>{index + 1}</td>
                <td className='px-6 py-4 flex items-center gap-3'>
                  <img src={item.student.imageUrl} alt="" className='w-9 h-9 rounded-full object-cover'/>
                  <span className='truncate font-medium text-gray-900'>{item.student.name}</span>
                </td>
                <td className='px-6 py-4 truncate'>{item.courseTitle}</td>
                <td className='px-6 py-4 hidden sm:table-cell'>{item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString() : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  ) : <Loading/>
}

export default StudentsEnrolled