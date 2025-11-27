import { UserButton, useUser } from '@clerk/clerk-react'
import { Link } from 'react-router-dom'
import { assets, dummyEducatorData } from '../../assets/assets'


const Navbar = () => {

  const eductorData = dummyEducatorData;
  const { user } = useUser();
  
  return (
    <div className='flex items-center justify-between px-8 py-4 border-b border-gray-200 sticky top-0 bg-white z-10'>
      <div className='flex items-center gap-3'>
        <Link to='/'>
          <img src={assets.eduStack_logo} alt="Logo" className='w-28' />
        </Link>
        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200 hidden md:block">Educator</span>
      </div>

      <div className='flex items-center gap-5 text-gray-500 relative'>
        <p className='hidden md:block'>Hi! {user ? user.fullName : 'Developers'}</p>
        {user ? <UserButton/> : <img className='max-w-8' src={assets.profile_img} alt="" /> }
      </div>
    </div>
  )
}

export default Navbar