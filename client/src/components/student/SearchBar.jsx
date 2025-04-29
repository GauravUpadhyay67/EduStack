import React, { useState } from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom';

const SearchBar = ({data}) => {

  const navigate = useNavigate();
  const [input, setInput] = useState(data ? data : '');

  const onSearchHandler = (e) => {
    e.preventDefault();
    if (input) {
      navigate(`/course-list/${input}`);
    } else {
      navigate('/course-list');
    }
  } 


  return (
    <form onSubmit={onSearchHandler} className='max-w-xl w-full h-12 flex items-center bg-white rounded-full shadow-md px-3 relative'>
      <img src={assets.search_icon} alt="search_icon" className='md:w-auto w-10 px-3' />
      <input 
        onChange={(e) => setInput(e.target.value)}
        value={input}
        type="text" 
        placeholder='Search for courses' 
        className='w-full h-full outline-none text-gray-500/80 rounded-full px-4' 
      />
      <button 
        type='submit' 
        className='bg-blue-600 text-white rounded-full md:px-8 px-6 md:py-3 py-2 absolute right-0 top-1/2 transform -translate-y-1/2'>
        Search
      </button>
    </form>
  )
}

export default SearchBar
