import { useClerk, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';

const AdminDashboard = () => {
    const { backendUrl, getToken } = useContext(AppContext);
    const navigate = useNavigate();
    const { user } = useUser();
    const { signOut } = useClerk();
    
    const [activeTab, setActiveTab] = useState('requests');
    const [requests, setRequests] = useState([]);
    const [courses, setCourses] = useState([]);
    const [educators, setEducators] = useState([]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, activeTab]);

    const fetchData = async () => {
        try {
            const token = await getToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };

            if (activeTab === 'requests') {
                const { data } = await axios.get(backendUrl + '/api/admin/educator-requests', config);
                if (data.success) setRequests(data.requests);
                else toast.error(data.message);
            } else if (activeTab === 'courses') {
                const { data } = await axios.get(backendUrl + '/api/admin/courses', config);
                if (data.success) setCourses(data.courses);
                else toast.error(data.message);
            } else if (activeTab === 'educators') {
                const { data } = await axios.get(backendUrl + '/api/admin/educators', config);
                if (data.success) setEducators(data.educators);
                else toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleApprove = async (requestId) => {
        try {
            const token = await getToken();
            const { data } = await axios.post(backendUrl + '/api/admin/approve-educator', { requestId }, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                toast.success(data.message);
                fetchData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleReject = async (requestId) => {
        try {
            const token = await getToken();
            const { data } = await axios.post(backendUrl + '/api/admin/reject-educator', { requestId }, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                toast.success(data.message);
                fetchData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if(!window.confirm("Are you sure you want to delete this course?")) return;
        try {
            const token = await getToken();
            const { data } = await axios.post(backendUrl + '/api/admin/delete-course', { courseId }, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                toast.success(data.message);
                fetchData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleBanEducator = async (userId) => {
        if(!window.confirm("Are you sure you want to ban this educator?")) return;
        try {
            const token = await getToken();
            const { data } = await axios.post(backendUrl + '/api/admin/ban-educator', { userId }, { headers: { Authorization: `Bearer ${token}` } });
            if (data.success) {
                toast.success(data.message);
                fetchData();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleLogout = () => {
        signOut();
        navigate('/');
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <img src={assets.eduStack_logo} alt="Logo" className="w-28" />
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-blue-200">Admin</span>
                </div>
                <button onClick={handleLogout} className="text-gray-600 hover:text-red-600 font-medium text-sm transition-colors">Logout</button>
            </div>

            <div className="flex flex-1">
                {/* Sidebar */}
                <div className="w-64 bg-white border-r border-gray-200 hidden md:block">
                    <div className="p-4 space-y-1">
                        <button 
                            onClick={() => setActiveTab('requests')} 
                            className={`w-full text-left px-4 py-2.5 rounded-md font-medium transition-colors ${activeTab === 'requests' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Educator Requests
                        </button>
                        <button 
                            onClick={() => setActiveTab('courses')} 
                            className={`w-full text-left px-4 py-2.5 rounded-md font-medium transition-colors ${activeTab === 'courses' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            All Courses
                        </button>
                        <button 
                            onClick={() => setActiveTab('educators')} 
                            className={`w-full text-left px-4 py-2.5 rounded-md font-medium transition-colors ${activeTab === 'educators' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            Educators
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6 capitalize">{activeTab.replace('-', ' ')}</h1>

                    {activeTab === 'requests' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {requests.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No pending requests</td></tr>
                                    ) : requests.map((req) => (
                                        <tr key={req._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-900">{req.userName}</td>
                                            <td className="px-6 py-4">{req.userEmail}</td>
                                            <td className="px-6 py-4">{new Date(req.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button onClick={() => handleApprove(req._id)} className="text-green-600 hover:bg-green-50 px-3 py-1 rounded border border-green-200 transition-colors">Approve</button>
                                                <button onClick={() => handleReject(req._id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded border border-red-200 transition-colors">Reject</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'courses' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3">Thumbnail</th>
                                        <th className="px-6 py-3">Title</th>
                                        <th className="px-6 py-3">Price</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {courses.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No courses found</td></tr>
                                    ) : courses.map((course) => (
                                        <tr key={course._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <img src={course.courseThumbnail} alt="" className="w-16 h-10 object-cover rounded" />
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">{course.courseTitle}</td>
                                            <td className="px-6 py-4">${(course.coursePrice - course.discount * course.coursePrice / 100).toFixed(2)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleDeleteCourse(course._id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded border border-red-200 transition-colors">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'educators' && (
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3">Profile</th>
                                        <th className="px-6 py-3">Name</th>
                                        <th className="px-6 py-3">Email</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {educators.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No educators found</td></tr>
                                    ) : educators.map((edu) => (
                                        <tr key={edu.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <img src={edu.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
                                            </td>
                                            <td className="px-6 py-4 font-medium text-gray-900">
                                                {edu.firstName || edu.lastName ? `${edu.firstName || ''} ${edu.lastName || ''}` : "Name Not Available"}
                                            </td>
                                            <td className="px-6 py-4">{edu.emailAddresses[0].emailAddress}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleBanEducator(edu.id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded border border-red-200 transition-colors">Ban (Revoke Role)</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard;
