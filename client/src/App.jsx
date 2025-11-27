import "quill/dist/quill.snow.css"
import { Route, Routes, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import Loading from './components/student/Loading'
import Navbar from './components/student/Navbar'
import AdminDashboard from './pages/admin/AdminDashboard'
import AddCourse from './pages/educator/AddCourse'
import Dashboard from './pages/educator/Dashboard'
import EditCourse from './pages/educator/EditCourse'
import Educator from './pages/educator/Educator'
import MyCourses from './pages/educator/MyCourses'
import StudentsEnrolled from './pages/educator/StudentsEnrolled'
import About from './pages/student/About'
import Contact from './pages/student/Contact'
import CourseDetails from './pages/student/CourseDetails'
import CoursesList from './pages/student/CoursesList'
import Home from './pages/student/Home'
import MyEnrollments from './pages/student/myEnrollments'
import Player from './pages/student/Player'
import Privacy from './pages/student/Privacy'



const App = () => {

  const location = useLocation();
  const isEducatorRoute = location.pathname.startsWith('/educator');
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className='text-default min-h-screen bg-white'>
      <ToastContainer/>
      {!isEducatorRoute && !isAdminRoute && <Navbar/>}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/course-list' element={<CoursesList/>}/>
        <Route path='/course-list/:input' element={<CoursesList/>}/>
        <Route path='/course/:id' element={<CourseDetails/>}/>
        <Route path='/my-enrollments' element={<MyEnrollments/>}/>
        <Route path='/player/:courseId' element={<Player/>}/>
        <Route path='/loading/:path' element={<Loading/>}/>
        <Route path='/about' element={<About/>}/>
        <Route path='/contact' element={<Contact/>}/>
        <Route path='/privacy' element={<Privacy/>}/>
        <Route path='/admin/dashboard' element={<AdminDashboard/>}/>

        <Route path='/educator' element={<Educator/>}>
          <Route path='/educator' element={<Dashboard/>}/>
          <Route path='add-course' element={<AddCourse/>}/>
          <Route path='edit-course/:id' element={<EditCourse/>}/>
          <Route path='my-courses' element={<MyCourses/>}/>
          <Route path='student-enrolled' element={<StudentsEnrolled/>}/>
        </Route>
        
      </Routes>
    </div>
  )
}

export default App