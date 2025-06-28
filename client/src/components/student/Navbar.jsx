import React, { useContext, useState } from "react";
import { assets } from "../../assets/assets";
import { Link } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import OtpModal from "./OtpModal"; // ✅ Adjust path if needed

const Navbar = () => {
  const { navigate, isEducator, backendUrl, setIsEducator, getToken } = useContext(AppContext);
  const { openSignIn } = useClerk();
  const { user } = useUser();

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(""); // ✅ OTP state

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
      toast.info("OTP sent to admin. Please enter it.");
      setOtp(""); // ✅ Clear any previous OTP
      setShowOtpModal(true);
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    toast.error(error.message);
  }
};


  const handleVerifyOtp = async (otp) => {
  try {
    const token = await getToken();
    const { data } = await axios.post(
      `${backendUrl}/api/educator/verify-otp`,
      { otp },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (data.success) {
      setIsEducator(true);
      setShowOtpModal(false);
      toast.success(data.message);
    } else {
      toast.error(data.message || "Verification failed.");
    }
  } catch (error) {
    const backendMessage =
      error.response?.data?.message || error.message || "Something went wrong.";
    toast.error(backendMessage);
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
        <div className="hidden md:flex items-center gap-5 text-gray-500">
          <div className="flex items-center gap-5">
            {user && (
              <>
                <button onClick={handleBecomeEducator}>
                  {isEducator ? "Educator Dashboard" : "Become Educator"}
                </button>
                | <Link to="/my-enrollments">My Enrollments</Link>
              </>
            )}
          </div>
          {user ? (
            <UserButton />
          ) : (
            <button
              onClick={() => openSignIn()}
              className="bg-blue-600 text-white px-5 py-2 rounded-full"
            >
              Create Account
            </button>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2 text-gray-500">
          <div className="flex items-center gap-1 text-sm">
            {user && (
              <>
                <button onClick={handleBecomeEducator}>
                  {isEducator ? "Educator Dashboard" : "Become Educator"}
                </button>
                | <Link to="/my-enrollments">My Enrollments</Link>
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

      {/* ✅ OTP Modal with correct props */}
      {showOtpModal && (
        <OtpModal
          otp={otp}
          setOtp={setOtp}
          onClose={() => setShowOtpModal(false)}
          onVerify={handleVerifyOtp}
        />
      )}
    </>
  );
};

export default Navbar;
