import React from "react";

const OtpModal = ({ otp, setOtp, onVerify, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-sm text-center relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
        >
          ✕
        </button>
        <h2 className="text-xl font-semibold mb-2">Enter OTP</h2>
        <p className="text-sm text-gray-600 mb-4">
          Check your admin email for the OTP
        </p>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="6-digit OTP"
          className="w-full px-4 py-2 border rounded-md mb-4 focus:outline-none focus:ring focus:border-blue-400"
        />
        <button
          onClick={() => onVerify(otp)} // ✅ call with OTP value, not event
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
        >
          Verify & Become Educator
        </button>
      </div>
    </div>
  );
};

export default OtpModal;
