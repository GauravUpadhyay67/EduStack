import { Outlet } from 'react-router-dom'
import Footer from '../../components/educator/Footer'
import Navbar from '../../components/educator/Navbar'
import Sidebar from '../../components/educator/Sidebar'

const Educator = () => {
  return (
    <div className='text-default min-h-screen bg-gray-50'>
        <Navbar/>
        <div className='flex'>
          <Sidebar/>
          <div className='flex-1'>
            {<Outlet/>}
          </div>
        </div>
        <Footer/>
    </div>
  )
}

export default Educator