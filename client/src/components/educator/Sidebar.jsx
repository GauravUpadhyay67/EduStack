import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';

const Sidebar = () => {

  const { isEducator } = useContext(AppContext);

  const menuItems = [
    { name: 'Dashboard', path: '/educator', icon: assets.home_icon},
    { name: 'Add Course', path: '/educator/add-course', icon: assets.add_icon},
    { name: 'My Courses', path: '/educator/my-courses', icon: assets.my_course_icon},
    { name: 'Student Enrolled', path: '/educator/student-enrolled', icon: assets.person_tick_icon},
  ]

  return isEducator &&  (
    <div className='md:w-64 w-16 border-r border-gray-200 min-h-screen bg-white'>
      <div className='md:p-4 p-2 space-y-1'>
        {menuItems.map((item) => (
          <NavLink
          to={item.path}
          key={item.name}
          end={item.path === '/educator'}
          className={({isActive}) =>`flex items-center md:flex-row flex-col md:justify-start justify-center py-2.5 md:px-4 gap-3 rounded-md transition-colors ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50' }`}
          >
            <img src={item.icon} alt="" className={`w-6 h-6 ${item.path === '/educator' ? '' : ''}`} />
            <p className='md:block hidden text-center font-medium'>{item.name}</p>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default Sidebar