import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { useContext } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";

const Navbar = () => {
  const { navigate, isEducator, backendUrl, setIsEducator, getToken } = useContext(AppContext);
  const { openSignIn } = useClerk();
  const { user } = useUser();



  const handleBecomeEducator = async () => {
    try {
      if (isEducator) {
        navigate("/educator");
        return;
      }

      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/educator/update-role`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success("Request sent to admin for approval. You'll be notified once approved.");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };




  return (
    <>
      <div
        className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${
          location.pathname.includes("/course-list") ? "bg-white" : "bg-cyan-100/70"
        }`}
      >
        <img
          onClick={() => navigate("/")}
          src={assets.eduStack_logo}
          alt="Logo"
          className="w-28 lg:w-42 cursor-pointer"
        />
        <div className="hidden md:flex items-center gap-8 text-gray-500">
          <Link to="/course-list">All Courses</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
        <div className="hidden md:flex items-center gap-5 text-gray-500">
          <div className="flex items-center gap-5">
            {user && user.primaryEmailAddress?.emailAddress !== 'upadhyaykumar2003@gmail.com' && (
              <>
                {isEducator ? (
                  <Link to='/educator' className='text-blue-600 font-semibold hover:text-blue-700 transition-colors'>
                    Educator Dashboard
                  </Link>
                ) : (
                  <>
                    <button onClick={handleBecomeEducator}>
                      Become Educator
                    </button>
                    | <Link to="/my-enrollments">My Enrollments</Link>
                  </>
                )}
              </>
            )}
            {user && user.primaryEmailAddress?.emailAddress === 'upadhyaykumar2003@gmail.com' && (
              <>
                <Link to="/admin/dashboard" className="text-purple-600 font-semibold">Admin Dashboard</Link>
              </>
            )}
          </div>
          {user ? (
            <UserButton />
          ) : (
            <button onClick={() => openSignIn()}>
              <img src={assets.user_icon} alt="user icon" />
            </button>
          )}
        </div>
      </div>

    </>
  );
};

export default Navbar;
