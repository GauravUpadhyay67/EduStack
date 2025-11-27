import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import Loading from '../../components/student/Loading';
import { AppContext } from '../../context/AppContext';

const Dashboard = () => {

  const { currency, backendUrl, isEducator, getToken } =  useContext(AppContext);
  const [dashboardData, setDashboardData] = useState(null)

  const fetchDashboardData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendUrl + '/api/educator/dashboard', 
        {headers: { Authorization: `Bearer ${token}` }}
      )

      if(data.success){
        setDashboardData(data.dashboardData)
      } else{
        toast.error(data.message)
      }
      
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if(isEducator){
      fetchDashboardData()
    }
  }, [isEducator])
  

  return dashboardData ? (
    <div className='min-h-screen flex flex-col items-start justify-between gap-8 md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='space-y-5 w-full'>
        <div className='flex flex-wrap gap-5 items-center'>

          <div className='flex items-center gap-3 shadow-sm border border-gray-200 p-4 w-56 rounded-md bg-white'>
            <img src={assets.patients_icon} alt="patients_icon" className='w-10' />
            <div>
              <p className='text-2xl font-medium text-gray-600'>{dashboardData.enrolledStudentsData.length}</p>
              <p className='text-base text-gray-500'>Total Enrollment</p>
            </div>
          </div>

          <div className='flex items-center gap-3 shadow-sm border border-gray-200 p-4 w-56 rounded-md bg-white'>
            <img src={assets.appointments_icon} alt="appointments_icon" className='w-10' />
            <div>
              <p className='text-2xl font-medium text-gray-600'>{dashboardData.totalCourses}</p>
              <p className='text-base text-gray-500'>Total Courses</p>
            </div>
          </div>

          <div className='flex items-center gap-3 shadow-sm border border-gray-200 p-4 w-56 rounded-md bg-white'>
            <img src={assets.earning_icon} alt="earning_icon" className='w-10' />
            <div>
              <p className='text-2xl font-medium text-gray-600'>{currency}{dashboardData.totalEarnings}</p>
              <p className='text-base text-gray-500'>Total Earnings</p>
            </div>
          </div>

        </div>

        <div>
          <h2 className='text-xl font-bold text-gray-800 mb-4'>Latest Enrollments</h2>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
          <table className='w-full text-left text-sm text-gray-600'>
            <thead className='bg-gray-50 text-gray-700 font-medium border-b border-gray-200'>
              <tr>
                <th className='px-6 py-3 hidden sm:table-cell'>#</th>
                <th className='px-6 py-3'>Student Name</th>
                <th className='px-6 py-3'>Course Title</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-100'>
              {dashboardData.enrolledStudentsData.map((item, index) => (
                <tr key={index} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 hidden sm:table-cell'>
                    {index + 1}
                  </td>
                  <td className='px-6 py-4 flex items-center gap-3'>
                    <img src={item.student.imageUrl} alt="Profile" className='w-9 h-9 rounded-full object-cover' />
                    <span className='truncate font-medium text-gray-900'>{item.student.name}</span>
                  </td>
                  <td className='px-6 py-4 truncate'>{item.courseTitle}</td>
                </tr>
              ))}
            </tbody>

          </table>
          </div>
        </div>

      </div>
    </div>
  ) : <Loading/>
}

export default Dashboard